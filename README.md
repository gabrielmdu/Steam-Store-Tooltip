# Steam Store Tooltip

<p align="center">
  <img src="src/img/icon.svg" width="100">
</p>

A Chrome extension that shows an informational tooltip when hovering a [Steam](https://store.steampowered.com) store link

https://user-images.githubusercontent.com/4662954/169218360-a2ee190d-4c16-456b-965c-1525d86654c5.mp4

## Features
- Quickly see all the relevant game's info in a tooltip:
  - price and discount
  - screenshots
  - categories
  - reviews positive rating
  - wishlisted or owned game (_available if you're logged in on the browser_)
  - description
  - release date
  - platforms
  - user tags
  - Metacritic score
- Choose the store language
- Choose the store currency (_available if you're __not__ logged in on the browser_)
- Activate the tooltip with a chosen key

## About third party APIs
This extension depends on two external APIs:

- Steam Store ([unofficial documentation](https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI)): for all info on games except for user tags. If this API stops working, the extension won't work
- [Steam Spy](https://steamspy.com/api.php): for user tags info

## Acknowledgments

- Tooltip functionality by [Tippy.js](https://atomiks.github.io/tippyjs/)
- Images carousel by [Glide.js](https://glidejs.com/)
- Arrow icons by [Reshot](https://www.reshot.com/)

[![sst](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png)](https://chrome.google.com/webstore/detail/steam-store-tooltip/loekhehhklndobiamaakjkefleckboon)
