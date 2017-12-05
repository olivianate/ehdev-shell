/**
 * Builder Service
 * @author ryan.bian
 */
const path = require('path');
const {
  Webpack,
  projectConfig,
  getProdConfig,
  getProvidePlugin,
  dllConfigParser,
  PROJECT_ROOT,
  noticeLog,
  UglifyJsPlugin,
  getUglifyJsOptions,
} = require('./config');

const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;

const AddAssetHtmlPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'add-asset-html-webpack-plugin'));
// const StatsPlugin = require(path.join(SHELL_NODE_MODULES_PATH, 'stats-webpack-plugin'));
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

getProdConfig(projectConfig)
  .then(webpackConfig => {
    try {
      if (projectConfig.providePluginConfig) {
        Object.assign(webpackConfig, {
          plugins: webpackConfig.plugins.concat(
            getProvidePlugin(projectConfig)
          ),
        });
      }
      const dllConfigs = dllConfigParser(projectConfig);
      if (dllConfigs) {
        webpackConfig.plugins.unshift(dllConfigs.getPlugin());
        webpackConfig.plugins.push(
          new AddAssetHtmlPlugin({
            filepath: path.resolve(PROJECT_ROOT, 'src/dll/*.js'),
          })
        );
      }
      webpackConfig.plugins.push(
        new UglifyJsPlugin(getUglifyJsOptions(projectConfig)),
        // new StatsPlugin(
        //   '../stats.json',
        //   'verbose'
        // ),
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: path.resolve(__dirname, '../../assets/report.html'),
          // Module sizes to show in report by default.
          // Should be one of `stat`, `parsed` or `gzip`.
          // See "Definitions" section for more information.
          defaultSizes: 'parsed',
          // Automatically open report in default browser
          // openAnalyzer: true,
          // If `true`, Webpack Stats JSON file will be generated in bundles output directory
          generateStatsFile: true,
          // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
          // Relative to bundles output directory.
          statsFilename: 'stats.json',
          // Options for `stats.toJson()` method.
          // For example you can exclude sources of your modules from stats file with `source: false` option.
          // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
          statsOptions: null,
          // Log level. Can be 'info', 'warn', 'error' or 'silent'.
          logLevel: 'info'
        })
      );
      Object.assign(webpackConfig, {
        profile: true,
      });
      const compiler = Webpack(webpackConfig);

      noticeLog('BUILD', 'START');

      compiler.run((err, stats) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          noticeLog('BUILD', 'FAILED', 'error');
          return;
        }
        if (stats.hasErrors()) {
          // eslint-disable-next-line no-console
          console.log(stats.toJson().errors[0].split('\n').slice(0, 2).join('\n'));
          noticeLog('BUILD', 'FAILED', 'error');
          return;
        }
        // eslint-disable-next-line no-console
        console.log('\n' + stats.toString({
          hash: false,
          chunks: false,
          children: false,
          colors: true,
        }));

        noticeLog('BUILD', 'SUCCESS', 'success');
      });

    } catch (e) {
      throw Error(e);
    }
  });

