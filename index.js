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

// Function to retrieve cookie, from Cloudflare Templates
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

const VARIANT_COOKIE = "variantID"

async function handleRequest(request) {
  let urlResponse = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  let variantsJson = await urlResponse.json()
  let variantsLinks = variantsJson["variants"]

  // See if there is a cookie of variantID and return it
  const cookie = getCookie(request, VARIANT_COOKIE)
  
  // If there is cookie for variant already, use that, else generate random variant
  let variant = cookie ? Number(cookie) : ((Math.random() < 0.5) ? 0 : 1)

  // Fetch one the variants and create a custom rewriter for that variant
  let variantResponse = await fetch(variantsLinks[variant])

  // If the cookie does not exist, set the cookie
  if (!cookie) {
    // Make headers mutable by recreating response
    variantResponse = new Response(variantResponse.body, variantResponse)
    variantResponse.headers.set('Set-Cookie', `${VARIANT_COOKIE}=${variant}`)
  }

  // Edit the response with custom html based on variant
  let rewriter = createRewriter(variant)
  let transformedResponse = await rewriter.transform(variantResponse)
  return transformedResponse;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
