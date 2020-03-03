const { override, fixBabelImports, addLessLoader, addWebpackModuleRule, addWebpackPlugin, setWebpackOptimizationSplitChunks } = require('customize-cra');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

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

  addWebpackPlugin(new AntdDayjsWebpackPlugin()),
  setWebpackOptimizationSplitChunks({
    chunks: 'async',
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 20,
    maxInitialRequests: 10,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      antdesign: {
        name: 'antdesign',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
        priority: -10,
      },
      ethers: {
        name: 'ethers',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](ethers-wan)[\\/]/,
        priority: -11,
      },
      wlchn: {
        name: 'wlchn',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](@wlchn)[\\/]/,
        priority: -11,
      },
      wansdk: {
        name: 'wansdk',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](ethers-wan)[\\/]/,
        priority: -11,
      },
      mimedb: {
        name: 'mimedb',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](mime-db)[\\/]/,
        priority: -11,
      },
      psl: {
        name: 'psl',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](psl)[\\/]/,
        priority: -11,
      },
      immutable: {
        name: 'psl',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](immutable)[\\/]/,
        priority: -11,
      },
      react: {
        name: 'psl',
        chunks: 'all',
        test: /[\\/]node_modules[\\/](react-dom|redux-form|core-js|ajv)[\\/]/,
        priority: -11,
      }
    },
   }),
);
