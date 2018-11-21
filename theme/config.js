module.exports={"license":"Apache-2.0","contributing":null,"architecture":null,"readme":"# landr\n\nsource code = website!\n\n> Build a website for your software projects with one command.\n\n## How it works\n\nWhen you run landr on your local repository, it gathers info by leveraging standard conventions.\nIt'll first look for a git remote from `github.com` and retrieve some basic information about your project from the github api (`contribution stats`, `releases`), it will then parse standard files like `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md` & `/docs`, it'll then use the data to build out beautiful pages for your website.\n\nThis allows the maintenance of your website to be a side effect of keeping your software project inline with standard github conventions.\n\n## Quick start guide\n\nInstall:\n```\nnpm i -g landr\n```\n\nFrom the root of your local `.git` repo run:\n```\nlandr\n```\n\nVisit `http://localhost:3000`.\n\nBuild site:\n```\nlandr build\n```\n\nView built site locally:\n```\nlandr serve\n```\n\nDeploy to github pages:\n```\nlandr deploy\n```\n\n## Why landr\n\nYou have to maintain your source code why maintain a website too?\n\nAs a software company we have a growing number of websites to build and maintain. We built landr so we could focus on our projects and not their websites.\n\nMost OS websites the same, the have a hero, a getting started and some docs. There is definitely room for automation.\n\n\n## Contributing\n\n```\nnpm i\n```\n\n```\nnpm link\n```\n\nGet to work. 👷\n\n## License\n\nLandr is free software, and may be redistributed under the terms specified in the [license](LICENSE).\n","name":"landr","public":true,"fork":false,"description":"source code = website 🏠","dependencies":["@octokit/rest","@resin.io/react-static","arch","babel-core","babel-plugin-styled-components","babel-polyfill","babel-preset-env","babel-preset-react","bluebird","capitano","color","color-convert","deepmerge","express","file-loader","fs-jetpack","gh-pages","github-buttons","github-slugger","gitinfo","lodash","mdast-util-heading-range","mdast-util-to-string","micro","mkdirp","path-parse","prop-types","qs","react","react-icons","react-twitter-widgets","redux","remark","remark-extract-frontmatter","remark-frontmatter","remark-highlight.js","remark-html","remark-parse","remark-slug","resin-components","resin-event-log","serve-handler","sniffr","styled-components","yaml"],"lastCommitDate":"2018-10-19T15:12:20Z","latestRelease":{"tagName":"v2.2.0","asssets":[]},"latestPreRelease":null,"githubUrl":"https://github.com/resin-io/landr"}