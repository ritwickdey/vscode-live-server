Contributing Guidelines
=======================

When implementing a new feature or a bugfix, consider these points:

* Is this thing useful to other people, or is it just catering for an obscure corner case resulting from e.g. weirdness in personal dev environment?
* Should the thing be live-server's responsibility at all, or is it better served by other tools?
* Am I introducing unnecessary dependencies when the same thing could easily be done using normal JavaScript / node.js features?
* Does the naming (e.g. command line parameters) make sense and uses same style as other similar ones?
* Does my code adhere to the project's coding style (observable from surrounding code)?
* Can backwards compatibility be preserved?

A few guiding principles: keep the app simple and small, focusing on what it's meant to provide: live reloading development web server. Avoid extra dependencies and the need to do configuration when possible and it makes sense. Minimize bloat.

If you are adding a feature, think about if it could be an extenral middleware instead, possible bundled with `live-server` in its `middleware` folder.

**New features should come with test cases!**

**Run `npm test` to check that you are not introducing new bugs or style issues!**
