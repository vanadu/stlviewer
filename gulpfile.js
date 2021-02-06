// !VA Gulpfile creation based on Craig Buckler: https://www.sitepoint.com/introduction-gulp-js/ with browser-sync tips from https://medium.com/swlh/setting-up-gulp-4-0-2-for-bootstrap-sass-and-browsersync-7917f5f5d2c5

// !VA NOTE: Buckler makes no reference to gulp requiring a default task, but gulp 4 requires a default task to run. While working on this before I got to the part where Buckley adds the default task, I added a dummy 'hello' default task 'logging' below just to write to the console, it's still in there just commented out. It shows how to write to the console in gulp.
// !VA NOTE: Installing gulp-noop appears to have uninstalled all the other gulp modules used here, including browser-sync. Had to reinstall a number of modules.
// !VA NOTE: THe most frequent mistake I make is including a comma after the last const declaration in the list.
// !VA NOTE: Sourcemaps aren't located in a separate map file, they're integrated into the CSS output now but they appear to work as long as the CSS output is piped to the src folder.
const 
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  noop = require('gulp-noop'),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  terser = require('gulp-terser'),
  stripdebug = require('gulp-strip-debug'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),
  browserSync = require('browser-sync').create()
  ;


// development mode?
// !VA This depends on a NODE.ENV variable that is not set on my machine. Can't comment out this line because it's referenced below. If I comment it out, I need to remove all references to it.
devBuild = (process.env.NODE_ENV !== 'production'),

// NOTE: Buckler creates folder path variables directly, not in an object. Other gulpfiles I've seen use:
// folder = {
//   src: 'app/',
//   build: 'dist/'
// };
// which requires referencing the path as folder.app or folder.src. Buckley just references the folders with variables:
src = 'site-app/',
build = 'site-dist/'

// !VA Use optimize images and output to /dist
function images() {
  const out = build + 'img/';
  return gulp.src(src + 'img/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
  // !VA }); Buckler includes extra closing para here that breaks code. Why the fuck?
};

// HTML processing -- Buckler says this only runs if NODE_ENV is set to 'production'. That would be specified in the ternary below, with noop being run if devBuild is set. But I deleted that development mode line above and ran it again, and still no HTML file was processed. I think that means that the NODE_ENV variable is not set. I don't know how to do that yet. Leave everything as is for now so it is ignored, see below on how to run htmlclean.
// !VA Changed the htmlclean line to: .pipe(htmlclean()) and copied the index.html file to app/html/index.html. It worked, but it requires putting the HTML file in a separate folder, so I will probably not use that, since I see no reason to obfuscate my HTML file.
// !VA This isn't applicable here. Changed the html folder to html files in the src folder
function html() {
  const out = build + '*.html';
  return gulp.src(src + '*.html')
    .pipe(newer(out))  //; !VA Buckler includes semicolon here that break code. Why the fuck? Second time.
    .pipe(devBuild ? noop() : htmlclean())
    // .pipe(htmlclean())
    .pipe(gulp.dest(out));
}

// JavaScript processing. 
// !VA Runs as expected.
// !VA Need to include the obfuscate plugin here
function js() {
  return gulp.src(src + 'js/**/*')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(deporder())
    // !VA Changed output file from main.js to app.js
    .pipe(concat('app.js'))
    .pipe(stripdebug ? stripdebug() : noop())
    .pipe(terser())
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(build + 'js/'));
}

// CSS processing
// !VA Had to reinstall gulp-sass because it magically hd been deleted. Won't let me install it for some reason. The reason was that a hidden bash was already running, all I had to do was close it in Windows Task Manager. After that, ran fine.
function css() {
  // !VA Changing main.scss to style.scss, since that's the one that loads all partials
  // return gulp.src(src + 'scss/main.scss')
  return gulp.src(src + 'scss/style.scss')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: '/img/',
      precision: 3,
      errLogToConsole: true
    }).on('error', sass.logError))
    .pipe(postcss([
      assets({ loadPaths: ['img/'] }),
      // !VA This is fix #1 from the stupid browserlist error message issue: autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
      autoprefixer(),
      mqpacker,
      cssnano
    ]))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    // !VA The CSS file need to go to app, not build, during dev. So we can pipe to two separate locations, added the one to src. 
    .pipe(gulp.dest(src + 'css/'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(build + 'css/'));
}

// !VA Now that we have the default task below, we can delete the dummy 'hello' task I had to create to get gulp to run at all.
// function hello(cb) {
//   console.log('Hi Van');
//   console.log('build is: ' + build);
//   cb();
// }
// gulp.task('default', gulp.series(hello))

// !VA Expose the js function
exports.js = js;
// !VA Expose the html and images functions and run them in series
exports.html = gulp.series(html, images);
// !VA Expose the images and css functions and run them in series. However, we are running the css function now from the browsersync serve function, so we don't need to do it here.
// exports.css = gulp.series(images, css);
exports.css = gulp.series(images);
// Export all the tasks to be run for the production build now. Note that we've removed the css function from this list because it's run now in the browser-sync serve function.
// exports.build = gulp.parallel(exports.html, exports.css, exports.js)
exports.build = gulp.parallel(exports.html, exports.js)

// !VA We don't want to watch for file changes to images at all, and changes to html and jhavascript are done in the browser-sync serve function. So we are deleting this watch function. When we want to compress images or minify the JS we will run those tasks manually.
// // watch for file changes
// function watch(done) {
//   // image changes
//   gulp.watch(src + 'images/**/*', images);
//   // html changes
//   gulp.watch(src + 'html/**/*', html);
//   // css changes
//   gulp.watch(src + 'scss/**/*', css);
//   // js changes
//   gulp.watch(src + 'js/**/*', js);
//   done();
// }
// exports.watch = watch;

function serve() {
  browserSync.init({
      server: {
         baseDir: src,
         index: "/index.html",
         server: "./app",
      },
      port: 3300,
      // Port for the browser-sync UI
      ui: {
        port: 3301
      }
  });
  // !VA watch is a predefined gulp function, not to be confused with a user-sefined watch function as below. The watch function takes a second argument that specifies the function that contains the browsersync stream to include in the watch method. If you don't include that argument, browsersync won't update that stream. So include the 'css' function as artument to the watch method run on the scss files. Also, I'm not sure whether we need to include all the scss or just style.scss since that's the one that includes all the partials.
  gulp.watch(src + 'scss/**/*.scss', css);
  gulp.watch(src + '*.html').on('change',browserSync.reload);
  gulp.watch(src + 'js/**/*.js').on('change', browserSync.reload);
}
// !VA Expose the serve function
exports.serve = serve;

// !VA Getting this message: Replace Autoprefixer browsers option to Browserslist config. It appears to be a notification rather than an error message, but it appears every time SCSS is updated. Super annoying. Looked here: https://github.com/gatsbyjs/gatsby/issues/14530 and the fix is: 1) Remove the 'last two versions' statement from the postcss pipe above and replace with just the call without the parameter 2) Add this to the package.json file

// "browserslist": [
//   "last 2 version",
//   "> 2%"
// ],

// !VA Then the message goes away.


// !VA This is the default task before implementing browser-sync, but we don't need to do all this until production. Until then all we need to do is compile the CSS and watch for changes. For production we can run the 'js' and 'html' functions manually with 'gulp build'.
gulp.task('default', gulp.series(exports.serve));

