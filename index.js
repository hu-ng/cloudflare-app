addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let url_response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  let variants_json = await url_response.json()
  let variants_links = variants_json["variants"]
  let variant = (Math.random() < 0.5) ? 0 : 1


  let response = Response.redirect(variants_links[variant], 302)
  return response
}
