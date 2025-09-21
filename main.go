package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"rogchap.com/v8go"
)

var (
	htmlShell string
	appCode   string
)

func main() {
	// Initialize the app on server start
	err := initializeApp()
	if err != nil {
		log.Fatal("Error initializing app:", err)
	}

	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("dist/assets/"))))
	// Setup HTTP routes
	http.HandleFunc("/", handleSSR)

	fmt.Println("SSR Server starting on http://localhost:3000")
	fmt.Println("Static files served from /static/")
	fmt.Println("React SSR on every request!")

	log.Fatal(http.ListenAndServe(":3000", nil))
}

func initializeApp() error {
	// Read the HTML shell once at startup
	shell, err := os.ReadFile("dist/index.html")
	if err != nil {
		return fmt.Errorf("error reading index.html: %w", err)
	}
	htmlShell = string(shell)

	// Read and transform App.js once at startup
	code, err := os.ReadFile("app.js")
	if err != nil {
		return fmt.Errorf("error reading app.js: %w", err)
	}
	appCode = string(code)

	fmt.Println("App initialized successfully")
	return nil
}

func handleSSR(w http.ResponseWriter, r *http.Request) {
	// Skip assets
	if strings.HasPrefix(r.URL.Path, "/assets/") {
		return
	}

	iso := v8go.NewIsolate()
	defer iso.Dispose()
	ctx := v8go.NewContext(iso)
	defer ctx.Close()

	setupReactInV8(ctx)

	// Execute the App component
	_, err := ctx.RunScript(appCode, "App.js")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error executing App.js: %v", err), http.StatusInternalServerError)
		return
	}

	// Render with current pathname for SSR
	renderScript := fmt.Sprintf(`
		const { renderToString } = ReactDOMServer;
		const appElement = React.createElement(globalThis.App, { 
			ssrPathname: '%s' 
		});
		renderToString(appElement);
	`, r.URL.Path)

	result, err := ctx.RunScript(renderScript, "render.js")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error rendering React component: %v", err), http.StatusInternalServerError)
		return
	}

	htmlContent := strings.Replace(htmlShell, "<!--ROOT-->", result.String(), 1)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, htmlContent)
}

func setupReactInV8(ctx *v8go.Context) {
	reactSetup := `
        const React = {
            createElement: function(type, props, ...children) {
                if (typeof type === 'function') {
                    return type(props || {});
                }
                
                const element = {
                    type: type,
                    props: props || {},
                    children: children.filter(child => child != null)
                };
                
                return element;
            },
            useState: function(initialState) {
                return [initialState, function() {}];
            },
		useEffect: function(effect, deps) {
				// SSR mock - effects don't run
				return;
			}

        };

        const ReactDOMServer = {
            renderToStaticMarkup: function(element) {
                return renderElement(element);
            },
            renderToString: function(element) {
                return renderElement(element);
            }
        };

        function renderElement(element) {
            if (typeof element === 'string' || typeof element === 'number') {
                return String(element);
            }
            
            if (!element || !element.type) {
                return '';
            }
            
            const { type, props, children } = element;
            const attrs = renderAttributes(props);
            const childrenStr = (children || []).map(renderElement).join('');
            
            const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
            if (voidElements.includes(type)) {
                return '<' + type + attrs + ' />';
            }
            
            return '<' + type + attrs + '>' + childrenStr + '</' + type + '>';
        }
    
		function renderAttributes(props) {
			if (!props) return '';
			
			return Object.keys(props)
				.filter(key => key !== 'children' && props[key] != null)
				.filter(key => !key.startsWith('on'))
				.map(key => {
					const value = props[key];
					if (typeof value === 'boolean') {
						return value ? ' ' + key : '';
					}
					
					// Handle style objects
					if (key === 'style' && typeof value === 'object') {
						const styleStr = Object.keys(value)
							.map(styleKey => {
								const styleProp = styleKey.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
								return styleProp + ': ' + value[styleKey];
							})
							.join('; ');
						return ' style="' + styleStr + '"';
					}
					
					const attrName = key === 'className' ? 'class' : key;
					return ' ' + attrName + '="' + String(value).replace(/"/g, '&quot;') + '"';
				})
				.join('');
		}
    `

	_, err := ctx.RunScript(reactSetup, "react-setup.js")
	if err != nil {
		log.Fatal("Error setting up React in V8:", err)
	}
}
