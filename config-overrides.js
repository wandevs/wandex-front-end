const { override, fixBabelImports, addLessLoader, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),

  addWebpackModuleRule({
    // test: /components\/.*\.scss$/,
    test: /\.scss$/,
    include: /components/,
    exclude: /node_modules/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
          modules: true,
          // localIdentName: "[local]__[hash:base64:5]", 
          localIdentName: '[path][name]__[local]__[hash:base64:5]'
        }
      },
      'sass-loader'
    ]
  }),

  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { 
      '@primary-color': '#1B1C2E',
      '@text-color':'#FFFFFF',
      '@component-background': '#303147',
      '@body-background':'#1B1C2E',
      '@background-color-light':'#1B1C2E',
      '@background-color-base':'#1B1C2E'
    },
  }),
);
