module.exports = (userDir, gitInfo) => {
  return `
  // Don't touch: this is an autogenerated file from ./config/gatsby-config.js
  module.exports = {
    plugins: [
      {
        resolve: 'gatsby-source-github',
        options: {
          owner: '${gitInfo.getUsername()}',
          repo: '${gitInfo.getName()}',
        },
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'readme',
          path: '${userDir}/README.md',
        },
      },
      'gatsby-plugin-postcss-sass',
      {
        resolve: 'gatsby-transformer-readme',
      },
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'changelog',
          path: '${userDir}/CHANGELOG.md',
        },
      },
      {
        resolve: 'gatsby-transformer-changelog',
        options: {
          headerDepth: 2
        },
      },
      {
        resolve: 'gatsby-plugin-landr',
        options: {
          userDir: '${userDir}'
        },
      },
    ],
    pathPrefix: '/${gitInfo.getName()}'
  }
  `;
};
