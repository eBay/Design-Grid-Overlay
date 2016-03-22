module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['src/controllers/*.js', 'src/*.js','src/vendor/*.js'],
        dest: 'dist/scripts/main.min.js'
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/css/main.css': ['src/css/popup.css', 'src/css/tab.css'],
          'dist/css/grid.css' : ['src/css/grid.css']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          '.tmp/popup.html': ['src/popup.html']
        }
      }
    },
    htmlmin: {                                    
      dist: {                                      
        options: {                                
          removeComments: true,
          collapseWhitespace: true
        },
        files: {                                   
          'dist/popup.html': '.tmp/popup.html',     
        }
      }
    },
    watch: {
      files: ['src/*/*', 'src/*'],
      tasks: ['build'],
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Default task(s).
  grunt.registerTask('build', ['uglify', 'cssmin', 'processhtml:dist', 'htmlmin:dist']);
  grunt.registerTask('default', ['build', 'watch']);

};