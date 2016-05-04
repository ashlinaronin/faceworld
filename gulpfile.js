//TODO: figure out why libs.js is so much bigger than the two files ostensibly in it...

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var del = require('del');

var paths = {
    mainScripts: [
        'src/app.js',
        'src/**/*.js',
        'src/**/*Provider.js',
        'src/**/*Module.js',
        'src/**/*Route.js',
        'src/**/*Ctrl.js',
        'src/**/*Service.js',
        'src/**/*Directive.js',
        'src/**/*Filter.js'
    ],
    obj: 'src/assets/**/*.obj'
};

var reload = browserSync.reload;

gulp.task('dev:styles', function() {
    return gulp.src('src/styles/*.scss')
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.sass.sync({
          outputStyle: 'expanded',
          precision: 10,
          includePaths: ['.']
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/styles'))
      .pipe(reload({stream: true}));
});

gulp.task('dev:images', function() {
    return gulp.src('app/assets/images/**/*')
      .pipe($.cache($.imagemin({
          progressive: true,
          interlaced: true,
          // don't remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{cleanupIDs: false}]
      })))
      .pipe(gulp.dest('dist/images'));
});

gulp.task('dev:obj', function() {
    return gulp.src(paths.obj)
    .pipe(gulp.dest('dist/assets/'))
    .pipe(reload({stream: true}));
});

gulp.task('dev:main-scripts', function() {
    return gulp.src(paths.mainScripts)
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.concat('main.js'))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/scripts'))
      .pipe(reload({stream: true}));
});


gulp.task('dev:lib-scripts', function(){
    return gulp.src([
        'node_modules/angular/angular.min.js',
        'lib/three.js',
        'lib/OBJLoader.js'
    ])
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.concat('lib.js'))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/scripts'))
      .pipe(reload({stream: true}));
});

gulp.task('prod:lib-scripts', function(){
    return gulp.src([
        'node_modules/angular/angular.js',
        'lib/three.js'
       ])
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.concat('lib.js'))
      .pipe($.uglify())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/scripts'))
      .pipe(reload({stream: true}));
});

gulp.task('dev:index-html', function(){
    return gulp.src('src/*.html')
      .pipe(gulp.dest('dist'))
      .pipe(reload({stream: true}));
});

gulp.task('dev:views', function() {
    return gulp.src('src/components/**/*.html',
        {base: 'src/components/'})
      .pipe(gulp.dest('dist/components'))
      .pipe(reload({stream: true}));;
});

function lint(files, options) {
    return function(){
        return gulp.src(files)
          .pipe(reload({stream: true, once: true}))
          .pipe($.eslint(options))
          .pipe($.eslint.format())
          .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
    };
}
var testLintOptions = {
    env: {
        mocha: true
    }
};

gulp.task('lint', lint('app/**/*.js'));

gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('serve', [
    'dev:lib-scripts', 'dev:styles', 'dev:obj', 'dev:images',
    'dev:main-scripts', 'dev:index-html', 'dev:views'],
    function() {
        browserSync({
            notify: false,
            port: 4000,
            server: {
                baseDir: ['dist']
            }
        }
    );

    gulp.watch('styles/*.scss', ['dev:styles']);
    gulp.watch(paths.mainScripts, ['dev:main-scripts']);
    gulp.watch('app/assets/images/**/*', ['dev:images']);
    gulp.watch('app/modules/**/*.html', ['dev:views']);
});


gulp.task('build', [], function(){
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function(){
    gulp.start('serve');
});

gulp.task('prod', ['prod:lib-scripts', 'dev:styles', 'dev:images', 'dev:main-scripts', 'dev:index-html', 'dev:views']);
