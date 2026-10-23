# Unofficial Phasmo Cheat Sheet

A client facing web-app guide for the horror video game Phasmophobia.

## Copyright Notice

This repository may contain some left over assets from Phasmophobia (used with permission) that are needed for this website to run. These assets are excluded from the license and may not be used without permission from Kinetic Games. 

`Phasmophobia, the Phasmophobia logo, and any game related info, images, or sounds (specifically footstep sounds, banshee scream, and deogen breathing) are either ® or TM, Kinetic Games Limited. Any assets used  within this site are used with direct permission from Kinetic Games.`

`The Zero-Network "Unofficial Phasmophobia Cheat Sheet" is not created by nor affiliated with Kinetic Games, its developers, or partners. This service is created by an independent third party.`

`This service is created as an educational tool for the Phasmophobia community, no copyright infringement intended.`

---
`Fair Use Disclaimer:`

`Copyright Disclaimer Under Section 107 of the Copyright Act 1976, allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship and research. Fair use is a use permitted by copyright statute that might otherwise be infringing.`

---
`The website itself, its design, layout, and functionality are copyrighted by Ty Bayn (Zero-Network).`

## Derivative Works

It is understandable that one may want to fork this repository and modify it for a different game. We encourage this! Please be mindful of the permissions, conditions, and limitations of the GNU AGPLv3 license.

NOTE: By using this code, you agree to not use any included, external URLs present in the code in your derived works as they likely link to copyrighted material or non-privileged resources.

## Traditional Chinese (zh-tw)

`lang-v10/zh-tw` is generated from `lang-v10/zh-cn` with OpenCC (Taiwan phrasing) plus the fixes in `lang-v10/zh-tw/tw-phrases.js`. The server has no zh-tw data, so when zh-tw is selected `lang-v2.js` requests zh-cn data and converts it in the browser.

After zh-cn changes, regenerate:

```
node tools/zh-tw/build-zh-tw.js
python tools/zh-tw/subset-fonts.py <LXGWWenKaiTC-Regular.ttf> <Huninn-Regular.ttf>
```

## License
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)

With the exception of:  
JQuery - MIT License  
October Crow Font - Custom License  
Caveat Font - STL Open Font License  
Troubleside Font - SIL Open Font License (OFL)  
Zaychik Font - CC, Zaychik is developed by Maria Khmelevskaya at HSE ART AND DESIGN SCHOOL  
LXGW WenKai TC Font (subset) - SIL Open Font License (OFL)  
Huninn Font (subset) - SIL Open Font License (OFL)  
opencc-js - MIT License