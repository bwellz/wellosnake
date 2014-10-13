'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'bwells';
    var applicationModuleVendorDependencies = [
        'ngAnimate',
        'ui.router',
        'ui.bootstrap'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('index', {
      url: '/',
      templateUrl: 'modules/core/views/index.client.view.html'
    });
  }
]);'use strict';
/*global $:false */
angular.module('core').controller('IndexController', [
  '$scope',
  '$timeout',
  function ($scope, $timeout) {
    function resize_func() {
      // Calculate window size
      var window_height = Math.ceil(window.innerHeight);
      var window_width = Math.ceil(window.innerWidth);
      // Calculate a relative header_height (applied to both headers)
      var header_height = window_width / 40;
      $('.main_nav').height(header_height + 'px');
      $('#canvas_head').height(header_height + 'px');
      // Subtract the header height from the window_height and use that as a starting guess for the canvas
      window_height -= header_height * 2;
      $scope.canvas_width = window_width;
      // apply a notional 4:3 aspect ratio
      $scope.canvas_height = $scope.canvas_width * 0.75;
      // if the calculated height exceeds the allowed window_height, restrict by height instead
      if ($scope.canvas_height > window_height) {
        $scope.canvas_height = window_height;
        $scope.canvas_width = window_height * 1.33333;
        // ensure there is no extra padding when restricted by height
        $('#canvas_container').css('padding', '0');
      } else {
        // vertically center the canvas container when restricted by width
        $('#canvas_container').css('padding', (window_height - $scope.canvas_height) / 2 + 'px 0');
      }
      // set remaining properties that need to be set
      $('.canvas_layer').width($scope.canvas_width);
      $('#canvas_container').height($scope.canvas_height + $('#canvas_head').height());
      // dynamically calculate relative font size to keep it static
      $scope.header_font_size = window_width / 700;
      $scope.overlay_font_size = $scope.canvas_width / 600;
      // apply all these snazzy scope changes
      $scope.$apply();
    }
    // call the resize function when first loaded and when resized
    $timeout(function () {
      resize_func();
    }, 100);
    $(window).resize(function () {
      resize_func();
    });
  }
]);/* Polyfill for RequestAnimationFrame */
(function () {
  var lastTime = 0;
  var vendors = [
      'ms',
      'moz',
      'webkit',
      'o'
    ];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
}());
/* Directive for Wello Snake */
angular.module('core').directive('welloSnake', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        w: '=',
        h: '=',
        overlayfontsize: '=',
        headerfontsize: '='
      },
      templateUrl: 'modules/core/views/snake.client.view.html',
      link: function (scope, element, attrs) {
        /* make the element point to the canvas and grab the canvas context */
        element = document.getElementById('snakegame');
        var ctx = element.getContext('2d');
        /* Watch for resize events and set the canvas size appropriately.
      Changing canvas size requires a redraw */
        var resize = function () {
          if (dimension !== null) {
            element.style.width = scope.w + 'px';
            element.style.height = scope.h + 'px';
            ctx.canvas.width = dimension[0] * 10;
            ctx.canvas.height = dimension[1] * 10;
            redraw();
          }
        };
        scope.$watch('w+h', resize);
        /* Request full screen when the user clicks "Fullscreen" */
        scope.goFullscreen = function () {
          var elem = document.getElementById('wellosnake');
          if (elem.requestFullscreen) {
            // W3C API
            elem.requestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            // Mozilla current API
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullScreen) {
            // Webkit current API
            elem.webkitRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            // IE current API
            elem.msRequestFullscreen();
          } else {
            alert('Fullscreen not supported for your browswer');
          }
        };
        /* CONSTANTS */
        // Return types for Collidables (basic gameplay element)
        var HIT_WALL = -1;
        var HIT_CANDY = -2;
        var PLAYER_SNAKE_TYPE = 0;
        var AI_SNAKE_GATHERER_TYPE = 1;
        // (Target Food)
        var AI_SNAKE_ASSASSIN_TYPE = 2;
        // (Target Player Head)
        var AI_SNAKE_CLOSEST_TYPE = 3;
        // (Target Food or Player Head -- Closest)
        var AI_SNAKE_FARTHEST_TYPE = 4;
        // (Target Food or Player Head -- Farthest)
        // Background color
        var CLEAR_COLOR = '#00F';
        // Number of boundary tests performed on a given candy while trying to spawn it before decreasing the buffer zone size.
        var MAX_CANDY_TRIES = 20;
        // Number of Canvas pixels around each block of a snake
        var SNAKE_BORDER_PIXELS = 2;
        // Used in the hash function x*HASH_MULTIPLIER+y
        var HASH_MULTIPLIER = 10000;
        // Default configuration values
        var DEFAULT_SPEED = 0;
        // slow
        var DEFAULT_DIMENSION = 1;
        // medium
        var DEFAULT_AI_SNAKES = 2;
        // any more is trouble for a beginner
        var DEFAULT_START_LENGTH = 2;
        // 20
        var DEFAULT_EXPAND_LENGTH = 2;
        // 10
        var DEFAULT_CANDY_BUFFER = 2;
        // 2, decently away from walls
        /* VARIABLES */
        /* Main data structures */
        var playing_field;
        // hash table
        var player_snake;
        // circularQueue
        var ai_snake;
        // array of circularQueues
        var candy;
        // special Collidable
        /* Fetch highscore from local storage, if it exists */
        scope.highscore = 0;
        var temp_highscore = parseInt(localStorage['highscore']);
        if (isNaN(temp_highscore)) {
          localStorage['highscore'] = 0;
        }
        if (temp_highscore > scope.highscore) {
          scope.highscore = temp_highscore;
        }
        /* Configuration Options */
        var speeds = [
            80,
            60,
            40,
            20
          ];
        var dimensions = [
            [
              40,
              30
            ],
            [
              60,
              45
            ],
            [
              80,
              60
            ]
          ];
        var starting_lengths = [
            5,
            10,
            20,
            50
          ];
        var expand_lengths = [
            1,
            5,
            10,
            50
          ];
        var candy_buffers = [
            0,
            1,
            2,
            3
          ];
        scope.ai_snake_options = [
          {
            value: 0,
            name: '0 (Trivial)'
          },
          {
            value: 1,
            name: '1 (Simple)'
          },
          {
            value: 2,
            name: '2 (Beginner)'
          },
          {
            value: 3,
            name: '3 (Recommended)'
          },
          {
            value: 4,
            name: '4 (Hard)'
          },
          {
            value: 5,
            name: '5 (Very Hard)'
          },
          {
            value: 6,
            name: '6 (Yikes!)'
          },
          {
            value: 7,
            name: '7 (Frustrating)'
          }
        ];
        scope.speed_options = [
          {
            value: 0,
            name: 'Slow (Beginner)'
          },
          {
            value: 1,
            name: 'Medium (Recommended)'
          },
          {
            value: 2,
            name: 'Fast (Hard)'
          },
          {
            value: 3,
            name: 'Twiddle Fingers (Impossible)'
          }
        ];
        scope.dimension_options = [
          {
            value: 0,
            name: 'Tiny (Hard)'
          },
          {
            value: 1,
            name: 'Regular (Recommended)'
          },
          {
            value: 2,
            name: 'Huge (Slower-Paced)'
          }
        ];
        scope.starting_length_options = [
          {
            value: 0,
            name: '5 (Tricky with AI)'
          },
          {
            value: 1,
            name: '10 (Easier)'
          },
          {
            value: 2,
            name: '20 (Recommended)'
          },
          {
            value: 3,
            name: '50 (Messy)'
          }
        ];
        scope.expand_length_options = [
          {
            value: 0,
            name: '5 (Very Easy)'
          },
          {
            value: 1,
            name: '5 (Easy)'
          },
          {
            value: 2,
            name: '10 (Recommended)'
          },
          {
            value: 3,
            name: '50 (Huge Mess)'
          }
        ];
        scope.candy_buffer_options = [
          {
            value: 0,
            name: 'No Buffer (Spawn Anywhere)'
          },
          {
            value: 1,
            name: '1 (Spawn 1+ Blocks from Walls)'
          },
          {
            value: 2,
            name: '2 (Spawn 2+ Blocks from Walls)'
          },
          {
            value: 3,
            name: '3 (Spawn 3+ Blocks from Walls)'
          }
        ];
        /* Player and AI Starting Locations (same for every map) */
        var starting_locations = [
            [
              0.2,
              0.13
            ],
            [
              0.8,
              0.87
            ],
            [
              0.2,
              0.87
            ],
            [
              0.8,
              0.13
            ],
            [
              0.9,
              0.6
            ],
            [
              0.9,
              0.4
            ],
            [
              0.1,
              0.6
            ],
            [
              0.1,
              0.4
            ]
          ];
        /* Point Calculation Items */
        var length_bonus = [
            1,
            1,
            2,
            4
          ];
        var speed_bonus = [
            0,
            20,
            50,
            100
          ];
        var speed_snake_bonus = [
            5,
            10,
            20,
            100
          ];
        var dimension_bonus = [
            7,
            3,
            2
          ];
        var speed_dimension_bonus = [
            1,
            2,
            5,
            10
          ];
        var candy_dimension_bonus = [
            30,
            20,
            10
          ];
        var extra_life_req = 1000;
        /* State variables */
        var speed;
        var base_speed;
        var dimension = null;
        var start_length;
        var expand_length;
        var candy_buffer;
        var extra_life_score;
        var next_stage_speedup;
        var kill_bonus, level_bonus, candy_bonus;
        /* Animation variables */
        var raf;
        var cur_time;
        var last_time;
        var leftover;
        /* Command variables */
        var action_queue;
        var response;
        /* SUPPORTING CLASSES */
        /* The Collidable class is the primary building block of snakes and the environment.
      Snakes, Walls, and Food all prototypically inherit from Collidable.
      hash_value is used as a key for the main hash that supports the game.
      A hash is used to store the game state instead of a 2D array due to the sparse nature of the data. */
        function Collidable(x, y) {
          this.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
            this.hash_value = x * HASH_MULTIPLIER + y;
          };
          this.setPosition(x, y);
        }
        function Wall(x, y) {
          this.color = '#F66';
          this.hit_value = HIT_WALL;
          Collidable.call(this, x, y);
        }
        function PlayerSnakeNib(x, y) {
          this.color = '#FF0';
          this.hit_value = PLAYER_SNAKE_TYPE;
          Collidable.call(this, x, y);
        }
        function AssassinSnakeNib(x, y) {
          this.color = '#F00';
          this.hit_value = AI_SNAKE_ASSASSIN_TYPE;
          Collidable.call(this, x, y);
        }
        function GathererSnakeNib(x, y) {
          this.color = '#0F0';
          this.hit_value = AI_SNAKE_GATHERER_TYPE;
          Collidable.call(this, x, y);
        }
        function ClosestSnakeNib(x, y) {
          this.color = '#F0F';
          this.hit_value = AI_SNAKE_CLOSEST_TYPE;
          Collidable.call(this, x, y);
        }
        function FarthestSnakeNib(x, y) {
          this.color = '#0FF';
          this.hit_value = AI_SNAKE_FARTHEST_TYPE;
          Collidable.call(this, x, y);
        }
        /* Candy is just a type of Collidable with methods to control its spawn location.
      Candy must not spawn on top of snakes or walls and may also include a buffer zone. */
        function Candy(collidable_hash, candy_buffer) {
          this.color = '#FFF';
          this.hit_value = HIT_CANDY;
          this.collidable_hash = collidable_hash;
          this.candy_buffer = candy_buffer;
          var first = true;
          /* Check the area around the test point to see if the test point is valid. */
          this.is_spawn_ok = function (x, y, buffer) {
            for (var i = x - buffer; i <= x + buffer; i++) {
              for (var j = y - buffer; j <= y + buffer; j++) {
                if (collidable_hash.test(i, j) !== null) {
                  return false;
                }
              }
            }
            return true;
          };
          /* On nearly-full boards, it may be time-consuming to find a valid spawn for candy with a large buffer zone.
        This method attempts to find a spawn point with the supplied buffer a certain number of times
        before decrementing the buffer area and trying again.
        That process continues until a location is found, potentially with no buffer area. */
          this.findSpawn = function () {
            var spawn_dist = this.candy_buffer;
            var x;
            var y;
            var tries = 0;
            x = Math.floor(Math.random() * collidable_hash.w);
            y = Math.floor(Math.random() * collidable_hash.h);
            while (!this.is_spawn_ok(x, y, spawn_dist)) {
              tries++;
              if (tries > MAX_CANDY_TRIES) {
                spawn_dist--;
                if (spawn_dist < 0) {
                  spawn_dist = 0;
                }
                tries = 0;
              }
              x = Math.floor(Math.random() * collidable_hash.w);
              y = Math.floor(Math.random() * collidable_hash.h);
            }
            first = false;
            Collidable.call(this, x, y);
            collidable_hash.add(this);
          };
          this.reset_candy = function () {
            if (!first)
              collidable_hash.remove(this);
            this.findSpawn();
          };
        }
        /* _.extend would not add to the prototype chain, just create a deep copy.
      Here we create an actual subclass. */
        Wall.prototype = Object.create(Collidable.prototype);
        PlayerSnakeNib.prototype = Object.create(Collidable.prototype);
        AssassinSnakeNib.prototype = Object.create(Collidable.prototype);
        GathererSnakeNib.prototype = Object.create(Collidable.prototype);
        ClosestSnakeNib.prototype = Object.create(Collidable.prototype);
        FarthestSnakeNib.prototype = Object.create(Collidable.prototype);
        Candy.prototype = Object.create(Collidable.prototype);
        /* A hash of Collidables holds all playing field information. */
        function CollidableHash(ctx, block_size, w, h) {
          this.hash = {};
          this.w = w;
          this.h = h;
          var block_size_pad = block_size - 2;
          var cur_size = 0;
          var max_size = w * h;
          /* Add a Collidable to the hash
        Collidables maintain their own hash key */
          this.add = function (elem) {
            if (elem instanceof Collidable) {
              if (!this.hash.hasOwnProperty(elem.hash_value)) {
                ctx.fillStyle = elem.color;
                ctx.fillRect(elem.x * block_size + 1, elem.y * block_size + 1, block_size_pad, block_size_pad);
                cur_size++;
              } else if (this.hash[elem.hash_value] instanceof Candy) {
                ctx.fillStyle = elem.color;
                ctx.fillRect(elem.x * block_size + 1, elem.y * block_size + 1, block_size_pad, block_size_pad);
              }
              this.hash[elem.hash_value] = elem;
            } else {
              throw new Error('CollidableHash only accepts Collidables');
            }
          }, this.remove = function (elem) {
            if (this.hash.hasOwnProperty(elem.hash_value) && !(this.hash[elem.hash_value] instanceof Wall)) {
              delete this.hash[elem.hash_value];
              ctx.fillStyle = CLEAR_COLOR;
              ctx.fillRect(elem.x * block_size, elem.y * block_size, block_size, block_size);
              cur_size--;
            }
          };
          /* Remove all Collidables from the hash */
          this.empty = function () {
            for (var key in this.hash) {
              delete this.hash[key];
            }
            cur_size = 0;
            ctx.fillStyle = CLEAR_COLOR;
            ctx.fillRect(0, 0, block_size * w, block_size * h);
          };
          /* Return the type of the Collidable at the given location if one exists */
          this.test = function (x, y) {
            var hash_test = x * HASH_MULTIPLIER + y;
            if (this.hash.hasOwnProperty(hash_test)) {
              return this.hash[hash_test].hit_value;
            } else {
              return null;
            }
          };
          /* Redraw the entire hash table 
        This will only trigger after a resize or after a stage is loaded
        All other updates will do small updates (e.g. paint over the tail and then paint the head of a snake) */
          this.redraw = function (ctx, block_size) {
            var collidable;
            var block_size_padding = block_size - SNAKE_BORDER_PIXELS;
            for (var key in this.hash) {
              collidable = this.hash[key];
              ctx.fillStyle = collidable.color;
              if (collidable.hit_value === HIT_WALL) {
                ctx.fillRect(collidable.x * block_size, collidable.y * block_size, block_size, block_size);
              } else {
                ctx.fillRect(collidable.x * block_size + 1, collidable.y * block_size + 1, block_size_padding, block_size_padding);
              }
            }
          };
        }
        /* Snakes are stored as a "Circular Pool Queue" of Collidables 
      Once in the data structure, Collidables aren't destroyed until the entire snake needs to be destroyed.
      Instead, the tail Collidable has its position updated to be the new head when the buffer is full.
      Expanding a snake involves simply splicing in a new array after the head. */
        function CircularCollidablePoolQueue(initial_size, collidable_hash, collidable_constructor) {
          this.buffer = _.range(initial_size).map(function () {
            return null;
          });
          var max_size = initial_size;
          var cur_size = 0;
          this.head = 0;
          this.tail = 0;
          this.collidable_constructor = collidable_constructor;
          /* we need to remove tail elements of max-sized buffers
        before adding (and testing) a new head element.
        This step is done for all snakes before any snake is able to calculate its next move. */
          this.clean_tail = function () {
            if (cur_size === max_size) {
              this.tail = this.head;
              collidable_hash.remove(this.buffer[this.tail]);
            }
          };
          /* add a new head element to this class and to the main hash table */
          this.enqueue = function (x, y) {
            if (cur_size === max_size) {
              this.buffer[this.head].setPosition(x, y);
            } else {
              this.buffer[this.head] = new this.collidable_constructor(x, y);
              cur_size++;
            }
            collidable_hash.add(this.buffer[this.head]);
            this.head++;
            if (this.head === max_size)
              this.head = 0;
          };
          /* AI snake types are chosen randomly after each reset
        This method allows the data structure to be reused with different Collidables */
          this.update_constructor = function (new_collidable_constructor) {
            this.collidable_constructor = new_collidable_constructor;
          };
          /* Destroy all the Collidables that compose the current snake; called during every reset */
          this.reset = function () {
            for (var i = 0; i < max_size; i++) {
              if (this.buffer[i] instanceof Collidable) {
                collidable_hash.remove(this.buffer[i]);
                delete this.buffer[i];
                this.buffer[i] = null;
              }
            }
            max_size = initial_size;
            cur_size = 0;
            this.head = 0;
            this.tail = 0;
          };
          /* Expand the data structure with a null-filled array of the size requested */
          this.expand = function (expand_amount) {
            max_size += expand_amount;
            Array.prototype.splice.apply(this.buffer, [
              this.head,
              0
            ].concat(_.range(expand_amount).map(function () {
              return null;
            })));
            if (this.tail > this.head) {
              this.tail += expand_amount;
            }
          };
        }
        /* The Player Snake expands the CircularQueue by tracking head position and handling key input */
        function PlayerSnake(initial_size, expand_size, collidable_hash) {
          this.collidable_hash = collidable_hash;
          this.expand_size = expand_size;
          this.reset_snake = function (x, y) {
            this.reset();
            this.x = x;
            this.y = y;
            this.dir_x = 1;
            this.dir_y = 0;
            this.enqueue(this.x, this.y);
          };
          this.keyInput = function (key) {
            if (this.dir_x === 0) {
              if (key === 2) {
                this.dir_y = 0;
                this.dir_x = 1;
                return true;
              } else if (key === 4) {
                this.dir_y = 0;
                this.dir_x = -1;
                return true;
              } else {
                if (this.dir_y === 0) {
                  if (key === 1) {
                    this.dir_x = 0;
                    this.dir_y = -1;
                    return true;
                  } else if (key === 3) {
                    this.dir_x = 0;
                    this.dir_y = 1;
                    return true;
                  }
                } else {
                  return false;
                }
              }
            } else {
              if (key === 1) {
                this.dir_x = 0;
                this.dir_y = -1;
                return true;
              } else if (key === 3) {
                this.dir_x = 0;
                this.dir_y = 1;
                return true;
              } else {
                return false;
              }
            }
          };
          CircularCollidablePoolQueue.call(this, initial_size, collidable_hash, PlayerSnakeNib);
        }
        /* The AI Snake expands the CircularQueue by tracking head position and handling simple AI steering */
        function AISnake(initial_size, expand_size, collidable_hash) {
          this.collidable_hash = collidable_hash;
          this.expand_size = expand_size;
          this.reset_snake = function (x, y) {
            this.reset();
            this.snake_type = 1 + Math.floor(Math.random() * 4);
            if (this.snake_type === AI_SNAKE_ASSASSIN_TYPE) {
              this.update_constructor(AssassinSnakeNib);
            } else if (this.snake_type === AI_SNAKE_CLOSEST_TYPE) {
              this.update_constructor(ClosestSnakeNib);
            } else if (this.snake_type === AI_SNAKE_FARTHEST_TYPE) {
              this.update_constructor(FarthestSnakeNib);
            } else {
              this.update_constructor(GathererSnakeNib);
            }
            this.x = x;
            this.y = y;
            this.dir_x = 0;
            this.dir_y = 0;
            this.alive = true;
            this.enqueue(x, y);
          };
          /* Method checks if a move would kill the snake */
          this.is_move_bad = function (x, y) {
            var hash_test_result = this.collidable_hash.test(x, y);
            if (hash_test_result !== null && hash_test_result !== HIT_CANDY) {
              return true;
            } else {
              return false;
            }
          };
          this.compute_action = function (player_x, player_y, candy_x, candy_y) {
            var goal_x;
            var goal_y;
            // Assassin (Red) Snakes steer towards the player head
            if (this.snake_type === AI_SNAKE_ASSASSIN_TYPE) {
              goal_x = player_x;
              goal_y = player_y;  // Smart (Purple) Snakes go for either the player or the food, whichever is closest
            } else if (this.snake_type === AI_SNAKE_CLOSEST_TYPE) {
              if (Math.abs(player_x - this.x) + Math.abs(player_y - this.y) < Math.abs(candy_x - this.x) + Math.abs(candy_y - this.y)) {
                goal_x = player_x;
                goal_y = player_y;
              } else {
                goal_x = candy_x;
                goal_y = candy_y;
              }  // Protector (Blue) Snakes float between the player and food by always moving towards the farthest away
            } else if (this.snake_type === AI_SNAKE_FARTHEST_TYPE) {
              if (Math.abs(player_x - this.x) + Math.abs(player_y - this.y) > Math.abs(candy_x - this.x) + Math.abs(candy_y - this.y)) {
                goal_x = player_x;
                goal_y = player_y;
              } else {
                goal_x = candy_x;
                goal_y = candy_y;
              }  // Gatherer (Green) Snakes only try to collect food
            } else {
              goal_x = candy_x;
              goal_y = candy_y;
            }
            goal_x -= this.x;
            goal_y -= this.y;
            /* The steering routine simply selects a valid move (if possible) that puts the snake closest to the target
          Loops cannot be detected since since the algorithm only selects between the three possible moves with no additional information */
            if (this.dir_x === 0) {
              if (goal_y > 0 && this.dir_y === 1 || goal_y < 0 && this.dir_y === -1) {
                if (this.is_move_bad(this.x, this.y + this.dir_y)) {
                  if (goal_x > 0) {
                    if (!this.is_move_bad(this.x + 1, this.y)) {
                      this.dir_x = 1;
                      this.dir_y = 0;
                    } else {
                      this.dir_x = -1;
                      this.dir_y = 0;
                    }
                  } else {
                    if (!this.is_move_bad(this.x - 1, this.y)) {
                      this.dir_x = -1;
                      this.dir_y = 0;
                    } else {
                      this.dir_x = 1;
                      this.dir_y = 0;
                    }
                  }
                }
              } else {
                if (goal_x > 0) {
                  if (!this.is_move_bad(this.x + 1, this.y)) {
                    this.dir_x = 1;
                    this.dir_y = 0;
                  } else {
                    if (!this.is_move_bad(this.x - 1, this.y)) {
                      this.dir_x = -1;
                      this.dir_y = 0;
                    }
                  }
                } else {
                  if (!this.is_move_bad(this.x - 1, this.y)) {
                    this.dir_x = -1;
                    this.dir_y = 0;
                  } else {
                    if (!this.is_move_bad(this.x + 1, this.y)) {
                      this.dir_x = 1;
                      this.dir_y = 0;
                    }
                  }
                }
              }
            } else {
              if (goal_x > 0 && this.dir_x === 1 || goal_x < 0 && this.dir_x === -1) {
                if (this.is_move_bad(this.x + this.dir_x, this.y)) {
                  if (goal_y > 0) {
                    if (!this.is_move_bad(this.x, this.y + 1)) {
                      this.dir_x = 0;
                      this.dir_y = 1;
                    } else {
                      this.dir_x = 0;
                      this.dir_y = -1;
                    }
                  } else {
                    if (!this.is_move_bad(this.x, this.y - 1)) {
                      this.dir_x = 0;
                      this.dir_y = -1;
                    } else {
                      this.dir_x = 0;
                      this.dir_y = 1;
                    }
                  }
                }
              } else {
                if (goal_y > 0) {
                  if (!this.is_move_bad(this.x, this.y + 1)) {
                    this.dir_x = 0;
                    this.dir_y = 1;
                  } else {
                    if (!this.is_move_bad(this.x, this.y - 1)) {
                      this.dir_x = 0;
                      this.dir_y = -1;
                    }
                  }
                } else {
                  if (!this.is_move_bad(this.x, this.y - 1)) {
                    this.dir_x = 0;
                    this.dir_y = -1;
                  } else {
                    if (!this.is_move_bad(this.x, this.y + 1)) {
                      this.dir_x = 0;
                      this.dir_y = 1;
                    }
                  }
                }
              }
            }
          };
          /* Lets the main loop know if this snake is alive
        If not, its AI function and other update functions will be skipped */
          this.is_alive = function () {
            return this.alive;
          };
          /* The main loop will call this method if the snake had no valid moves.
        This method will call reset on the underlying datastructure, cleaning up the snake. */
          this.kill = function () {
            this.alive = false;
            this.reset();
          };
          /* Piggyback on the super class constructor */
          CircularCollidablePoolQueue.call(this, initial_size, collidable_hash, null);
        }
        /* Both the player snake and AI snakes share the same routine for actually performing a self update 
      This gets added to the prototype of the snakes by using _.extend() */
        var updateSnakeMixin = {
            update: function () {
              if (this.dir_x !== 0) {
                if (this.dir_x === 1) {
                  this.x++;
                } else {
                  this.x--;
                }
              } else {
                if (this.dir_y === 1) {
                  this.y++;
                } else {
                  this.y--;
                }
              }
              var hash_test = this.collidable_hash.test(this.x, this.y);
              if (hash_test !== null) {
                if (hash_test === HIT_CANDY) {
                  this.enqueue(this.x, this.y);
                  this.expand(this.expand_size);
                } else {
                }
              } else {
                this.enqueue(this.x, this.y);
              }
              return hash_test;
            }
          };
        _.extend(PlayerSnake.prototype, updateSnakeMixin);
        _.extend(AISnake.prototype, updateSnakeMixin);
        /* GAMEPLAY FUNCTIONS */
        /* at the end of current reflow, set up initial configuration settings */
        $timeout(function () {
          scope.speed = DEFAULT_SPEED;
          scope.dimension = DEFAULT_DIMENSION;
          scope.ai_snakes = DEFAULT_AI_SNAKES;
          scope.starting_length = DEFAULT_START_LENGTH;
          scope.expand_length = DEFAULT_EXPAND_LENGTH;
          scope.candy_buffer = DEFAULT_CANDY_BUFFER;
          init();
        });
        /* In addition to the default configuration settings, the user may select their own */
        scope.open_config = function () {
          scope.configing = true;
          scope.paused = true;
          scope.edit_speed = scope.speed;
          scope.edit_dimension = scope.dimension;
          scope.edit_ai_snakes = scope.ai_snakes;
          scope.edit_starting_length = scope.starting_length;
          scope.edit_expand_length = scope.expand_length;
          scope.edit_candy_buffer = scope.candy_buffer;
        };
        scope.cancel_config = function () {
          $timeout(function () {
            scope.configing = false;
          });
        };
        scope.commit_config = function () {
          $timeout(function () {
            scope.speed = scope.edit_speed;
            scope.dimension = scope.edit_dimension;
            scope.ai_snakes = scope.edit_ai_snakes;
            scope.starting_length = scope.edit_starting_length;
            scope.expand_length = scope.edit_expand_length;
            scope.candy_buffer = scope.edit_candy_buffer;
            scope.configing = false;
            init();
          });
        };
        /* logic for setting up a game based on configuration data.
      Once setup, multiple games may be played using the same configuration */
        var init = function () {
          /* load actual configuration values into state variables */
          speed = speeds[scope.speed];
          candy_buffer = candy_buffers[scope.candy_buffer];
          expand_length = expand_lengths[scope.expand_length];
          start_length = starting_lengths[scope.starting_length];
          dimension = dimensions[scope.dimension];
          /* calculate point bonuses based on difficulty */
          kill_bonus = dimension_bonus[scope.dimension] * speed_dimension_bonus[scope.speed];
          level_bonus = kill_bonus * (1 + Math.floor(Math.pow(scope.ai_snakes, 1.2)));
          candy_bonus = 10 * length_bonus[scope.expand_length] * length_bonus[scope.starting_length] + candy_dimension_bonus[scope.dimension] + Math.floor(Math.pow(scope.ai_snakes, 1.3)) * speed_snake_bonus[scope.speed] * dimension_bonus[scope.dimension];
          /* construct the playing field (hash), snakes, and candy */
          playing_field = new CollidableHash(ctx, 10, dimension[0], dimension[1]);
          player_snake = new PlayerSnake(start_length, expand_length, playing_field);
          ai_snake = _.range(scope.ai_snakes).map(function () {
            return new AISnake(start_length, expand_length, playing_field);
          });
          candy = new Candy(playing_field, candy_buffer);
          /* resize doubles as our paint function which we can call now that dimension is set */
          resize();
          /* start a new game (max lives, stage 1, 0 points, etc..) */
          restart();
        };
        /* Reset the entire gamestate, lives and everything */
        function restart() {
          $timeout(function () {
            base_speed = 1;
            scope.lives = 5;
            scope.score = 0;
            scope.stage = 1;
            scope.cur_candy = 0;
            extra_life_score = extra_life_req;
            next_stage_speedup = 8;
            scope.needed_candy = 5;
            scope.newgame = true;
            load_stage();
          });
        }
        /* Loading a stage involves emptying the current hash table,
      loading the border, and then the stage-specific geometry.
      Loading a stage requires a full redraw. */
        function load_stage() {
          scope.paused = true;
          scope.gameover = false;
          scope.config = false;
          scope.dead = false;
          scope.cur_candy = 0;
          playing_field.empty();
          load_border();
          load_obstacles();
          redraw();
          reset();
        }
        /* Load a frame so snakes cannot exit the playing area */
        function load_border() {
          for (var i = 0; i < dimension[1]; i++) {
            playing_field.add(new Wall(0, i));
            playing_field.add(new Wall(dimension[0] - 1, i));
          }
          for (i = 0; i < dimension[0]; i++) {
            playing_field.add(new Wall(i, 0));
            playing_field.add(new Wall(i, dimension[1] - 1));
          }
        }
        /* wellosnake currently has 8 levels
      If the user completes all the levels, he or she repeats them at a higher speed */
        function load_obstacles() {
          var i;
          switch (scope.stage % 8) {
          case 2:
            for (i = Math.round(dimension[0] / 4); i < Math.round(dimension[0] - dimension[0] / 4); i++) {
              playing_field.add(new Wall(i, Math.round(dimension[1] / 2)));
            }
            break;
          case 3:
            for (i = Math.round(dimension[1] / 4); i < Math.round(dimension[1] - dimension[1] / 4); i++) {
              playing_field.add(new Wall(Math.round(dimension[0] / 4), i));
              playing_field.add(new Wall(Math.round(dimension[0] - dimension[0] / 4), i));
            }
            break;
          case 4:
            for (i = 0; i < Math.round(dimension[0] / 3); i++) {
              playing_field.add(new Wall(i, Math.round(dimension[1] / 3)));
              playing_field.add(new Wall(dimension[0] - i, Math.round(2 * dimension[1] / 3)));
            }
            for (i = 0; i < Math.round(dimension[1] / 3); i++) {
              playing_field.add(new Wall(Math.round(dimension[0] / 3), dimension[1] - i));
              playing_field.add(new Wall(Math.round(2 * dimension[0] / 3), i));
            }
            break;
          case 5:
            for (i = 0; i < Math.round(4 * dimension[0] / 9); i++) {
              playing_field.add(new Wall(i, Math.round(dimension[1] / 2)));
              playing_field.add(new Wall(dimension[0] - i, Math.round(dimension[1] / 2)));
            }
            break;
          case 6:
            for (i = Math.round(dimension[1] / 5); i < Math.round(4 * dimension[1] / 5); i++) {
              playing_field.add(new Wall(Math.round(4 * dimension[0] / 5), i));
              playing_field.add(new Wall(Math.round(3 * dimension[0] / 5), i));
              playing_field.add(new Wall(Math.round(2 * dimension[0] / 5), i));
              playing_field.add(new Wall(Math.round(dimension[0] / 5), i));
            }
            break;
          case 7:
            for (i = Math.round(dimension[1] / 8); i < Math.round(3 * dimension[1] / 5); i++) {
              playing_field.add(new Wall(Math.round(dimension[0] / 3), dimension[1] - i));
              playing_field.add(new Wall(Math.round(2 * dimension[0] / 3), i));
            }
            for (i = Math.round(dimension[0] / 8); i < Math.round(3 * dimension[0] / 5); i++) {
              playing_field.add(new Wall(i, Math.round(dimension[1] / 3)));
              playing_field.add(new Wall(dimension[0] - i, Math.round(2 * dimension[1] / 3)));
            }
            break;
          case 0:
            for (i = 0; i < Math.round(dimension[1]); i += 2) {
              playing_field.add(new Wall(Math.round(dimension[0] / 2), i));
            }
            break;
          default:
            break;
          }
        }
        /* Nuke the board and redraw it.  Necessary after a stage load and a resize */
        function redraw() {
          ctx.fillStyle = CLEAR_COLOR;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          playing_field.redraw(ctx, 10);
        }
        /* Reset back to the beginning of a round (beginning of a game and each time after the user dies) 
      Calls the methods of the snakes and candy to reset those structures as well */
        function reset() {
          cancelAnimationFrame(raf);
          cur_time = Date.now();
          leftover = 0;
          speed = speeds[scope.speed] * base_speed;
          action_queue = [];
          player_snake.reset_snake(Math.round(dimension[0] * starting_locations[0][0]), Math.round(dimension[1] * starting_locations[0][1]));
          for (var i = 0; i < scope.ai_snakes; i++) {
            ai_snake[i].reset_snake(Math.round(dimension[0] * starting_locations[i + 1][0]), Math.round(dimension[1] * starting_locations[i + 1][1]));
          }
          candy.reset_candy();
          requestAnimationFrame(draw);
        }
        /* draw() handles the frame rendering rate and calls the main loop of the routine 
      Multiple ticks may happen during the same animation frame in order to maintain the proper rate */
        function draw() {
          last_time = cur_time;
          cur_time = Date.now();
          leftover += cur_time - last_time;
          while (!scope.paused && leftover > speed) {
            update_loop();
            leftover -= speed;
          }
          raf = requestAnimationFrame(draw);
        }
        /* main logic function, may be called 0 or more times during a frame 
      It takes the following steps in the following order:
      1) remove the tail of each snake and paint background over it
      2) perform AI calculation and movement for enemy snakes
      3) make the next queued player action if it exists */
        function update_loop() {
          player_snake.clean_tail();
          // enemy actions
          for (var i = 0; i < scope.ai_snakes; i++) {
            ai_snake[i].clean_tail();
            ai_snake[i].compute_action(player_snake.x + player_snake.dir_x, player_snake.y + player_snake.dir_y, candy.x, candy.y);
            if (ai_snake[i].is_alive()) {
              response = ai_snake[i].update();
              if (response === HIT_CANDY) {
                candy.findSpawn();
              } else if (response !== null) {
                ai_snake[i].kill();
                score(kill_bonus);
              }
            }
          }
          // player action
          next_action();
          response = player_snake.update();
          if (response === HIT_CANDY) {
            got_candy();
          } else if (response !== null) {
            died();
            return;
          }
        }
        /* dequeue and commit an action if the action queue isn't empty */
        function next_action() {
          var is_input_valid;
          do {
            if (action_queue.length > 0) {
              is_input_valid = player_snake.keyInput(action_queue.shift());
            } else {
              is_input_valid = true;
            }
          } while (is_input_valid === false);
        }
        /* Update player score and assign extra lives if the criteria is met
      Also checks for opportunity to update the highscore */
        function score(num) {
          $timeout(function () {
            scope.score += num;
            while (scope.score > extra_life_score) {
              extra_life_score += extra_life_req;
              scope.lives++;
            }
            if (scope.score > scope.highscore) {
              scope.highscore = scope.score;
              localStorage['highscore'] = scope.highscore;
            }
          });
        }
        /* The player died, reset the game state and deduct a life.
      Display gameover if the player is completely out of lives */
        function died() {
          $timeout(function () {
            scope.lives--;
            scope.paused = true;
            if (scope.lives === 0) {
              scope.gameover = true;
              scope.dead = false;
            } else {
              scope.dead = true;
              scope.gameover = false;
            }
          });
        }
        /* The game speeds up with candy
      Also, 5 candy means the stage is complete */
        function got_candy() {
          score(candy_bonus);
          speed /= 1.13;
          candy.findSpawn();
          $timeout(function () {
            scope.cur_candy++;
            if (scope.cur_candy === scope.needed_candy) {
              next_stage();
            }
          });
        }
        /* If an enemy got the candy, incremenent the speed a bit.
      This is useful for pressuring the player and keeping tension high */
        function ai_candy() {
          speed /= 1.08;
        }
        /* If the user got 5 candies, they will progress to the next stage
      If the user completed the last map, loop around to the beginning and increase speed */
        function next_stage() {
          scope.stage++;
          if (scope.stage === next_stage_speedup) {
            next_stage_speedup += 8;
            base_speed /= 1.25;
          }
          scope.newstage = true;
          score(level_bonus);
          load_stage();
        }
        /* The user may restart the game at any time (using current configuration) */
        scope.restart = function () {
          restart();
        };
        /* WASD or arrow keys move the snake (only arrow keys for fullscreen currently) 
      "spacebar" toggles pause */
        document.addEventListener('keydown', function (event) {
          switch (event.keyCode) {
          case 37:
          //left
          case 65:
            //a
            if (!scope.paused) {
              queue_action(4);
            }
            break;
          case 38:
          //up          
          case 87:
            //w
            if (!scope.paused) {
              queue_action(1);
            }
            break;
          case 39:
          //right       
          case 68:
            //d
            if (!scope.paused) {
              queue_action(2);
            }
            break;
          case 40:
          //down          
          case 83:
            //s
            if (!scope.paused) {
              queue_action(3);
            }
            break;
          case 32:
            //space
            if (!scope.configing) {
              togglePause();
            }
            break;
          }
        });
        /* The user may force an unpause by clicking a button/link */
        scope.force_unpause = function () {
          unPause();
        };
        /* All user actions (except pause) are added to a queue 
      On each main game iteration, one action is dequeued */
        function queue_action(action) {
          action_queue.push(action);
        }
        /* "space" toggles pause
      It may also 'accept' certain messages displayed */
        function togglePause() {
          if (scope.paused) {
            unPause();
          } else {
            $timeout(function () {
              scope.dead = false;
              scope.paused = true;
              scope.gameover = false;
              scope.newstage = false;
            });
          }
        }
        function unPause() {
          if (scope.paused) {
            $timeout(function () {
              if (scope.gameover) {
                restart();
              } else {
                if (scope.dead) {
                  reset();
                }
                cur_time = Date.now();
                leftover = 0;
                scope.paused = false;
                scope.dead = false;
                scope.newgame = false;
                scope.newstage = false;
              }
            });
          }
        }
      }
    };
  }
]);