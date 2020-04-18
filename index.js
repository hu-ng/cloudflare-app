// Custom element rewriter class, takes an object with keys as selectors and values as content
class ContentRewriter {
  constructor(input) {
    this.content = input
  }
 
  element(element) {
    // If it's an <a> tag, since there is only one here, set href attribute to a link
    if (element.tagName =="a") {
      element.setAttribute("href", this.content["link"])
    }
    element.setInnerContent(this.content["text"])
  }
}

// Create a custom rewriter based on the variant of the URL
function createRewriter(variant){
  let content = customContent(variant)
  return new HTMLRewriter()
    .on('title', new ContentRewriter(content["title"]))
    .on('h1#title', new ContentRewriter(content["h1#title"]))
    .on('p#description', new ContentRewriter(content["p#description"]))
    .on('a#url', new ContentRewriter(content["a#url"]))
}

// Create custom content based on the variant of the URL. Used by the functions above
function customContent(variant) {
  return {
    "title": {"text": `Variant ${variant + 1}`},
    "h1#title": {"text": `This is variant number ${variant + 1}`},
    "p#description": {"text": variant === 0 ? "This variant is nice" : "This variant is ok"},
    "a#url": 
      {
        "link": "https://hu-ng.github.io", 
        "text":"My personal website!"
      }
  }
}

async function handleRequest(request) {
  let url_response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  let variants_json = await url_response.json()
  let variants_links = variants_json["variants"]
  let variant = (Math.random() < 0.5) ? 0 : 1  // Randomization

  // Fetch one the variants and create a custom rewriter for that variant
  let response = await fetch(variants_links[variant])
  let rewriter = createRewriter(variant)
  return rewriter.transform(response);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
