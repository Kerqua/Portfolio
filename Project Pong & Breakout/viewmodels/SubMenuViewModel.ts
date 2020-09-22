class SubMenuViewModel extends DataPropertyNotification {
    public static Create(app: R4HealApp, game: string): Promise<SubMenuViewModel> {
        return new Promise<SubMenuViewModel>((resolve, reject) => {
            new SubMenuViewModel(app, game, (viewModel) => {
                resolve(viewModel);
            });
        });
    }

    private _app: R4HealApp;

    private _actions: ObservableArray<ActionItemViewModel> = new ObservableArray<ActionItemViewModel>();
    public get Actions(): ObservableArray<ActionItemViewModel> { return this._actions; }

    public get Username() { return this._username; }
    private _username = "Gast";
    public get Time() { return this._time; }
    private _time = "22:00";
    public get Date() { return this._date; }
    private _date = "2011/01/01";

    private _game: string;

    private _timerInterval: number = null;
    private constructor(app: R4HealApp, game: string, callback) {
        super();

        this._game = game;

        var updateTime = () => {
            var now = new Date();
            var minutes = now.getMinutes();
            var hours = now.getHours();
            this._time = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            this._date = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate();

            this.changed("Time", this._time);
            this.changed("Date", this._date);
        };
        updateTime();

        this._app = app;
        app.GameData.isInitialized().then(() => {
            var gameDataPackage = app.GameData.Data;
            var gameData = gameDataPackage['data'];

            var hasSkeleton = app.InputService.Services.contains("Skeleton");
            var hasStepper = app.InputService.Services.contains("Step") || app.InputService.Services.contains("Stepper");

            this._username = this._app.UserService.User.Name;
            var atSignIdx = this._username.indexOf('@');
            if (atSignIdx != -1) {
                this._username = this._username.substr(0, atSignIdx);
            }

            this._actions.addRange([
                //new ActionItemViewModel('return', 'Return to the main menu', '?view=Menu'),
                new ImageActionItemViewModel("return", "assets/dashboard/return-icon.svg", "return", "Return to the main menu", "?view=Menu")
            ]);

            if (this._game == "GrowingGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('vitallity', 'assets/dashboard/growinggame-thumbnail.jpg', 'Grow', 'Grow a tree byu moving about', '?view=GrowingGame')
                ]);
            }
            else if (this._game == "StepperGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('vitallity', 'assets/dashboard/birdclimber-thumbnail.jpg', 'Bird climber', 'Help birds climb up', '?view=StepperGame'),
                ]);
            }
            else if (this._game == "JigsawGame") {

                this._actions.addRange([
                    new ImageActionItemViewModel('random_puzzle', 'assets/dashboard/jigsaw-thumbnail.png', 'jigsaw puzzle', 'Start a random jigsaw puzzle game', '?view=JigsawGame'),
                    new ImageActionItemViewModel('random_interactive_jigsaw', 'assets/dashboard/jigsaw-thumbnail.png', 'interactive jigsaw puzzle', 'Start a random interactive jigsaw puzzle game', '?view=InteractiveJigsawGame')
                ]);

                //Add puzzles
                var jigsawpuzzles = gameData.jigsawpuzzles;
                for (var i = 0; i < jigsawpuzzles.length; i++) {
                    var jigsawpuzzle = jigsawpuzzles[i];
                    if (!jigsawpuzzle.menu)
                        continue;

                    var thumbUrl: string;
                    if (jigsawpuzzle.thumbnail) {
                        thumbUrl = jigsawpuzzle.thumbnail;
                    }
                    else {
                        thumbUrl = jigsawpuzzle.asset.replace(".", ".thumbnail.")
                    }

                    var subtitle = "jigsaw puzzle"
                    if (jigsawpuzzle.artist != undefined) {
                        subtitle = jigsawpuzzle.artist
                    }

                    this._actions.push(
                        new ImageActionItemViewModel(subtitle, thumbUrl, jigsawpuzzle.name, null, '?view=JigsawGame&param=' + i)
                    );
                }
            }
            else if (this._game == "WordFinderGame") {

                this._actions.addRange([
                    new ImageActionItemViewModel('word finder', 'assets/dashboard/random-thumbnail.svg', 'random_puzzle', 'Start a random word finder game', '?view=WordFinderGame'),
                ]);

                //Add puzzles
                var wordfinders = gameData.wordfinder;
                var tags = new SmartArray<string>();
                for (var i = 0; i < wordfinders.length; i++) {
                    var wordfinder = wordfinders[i] as { tags: string[], subject: string, words: string[] };
                    //console.log("Wordfinder: ", wordfinder);
                    if (wordfinder.tags) {
                        tags.addRange(wordfinder.tags.filter(p => !tags.contains(p)));
                    }
                }
                //console.log("Tags: ", tags);

                for (var i = 0; i < tags.length; i++) {
                    var tag = tags[i];

                    var thumbUrl = "assets/dashboard/wordfinder-" + tag + "-thumbnail.svg";
                    this._actions.push(
                        new ImageActionItemViewModel("word finder", thumbUrl, tag, null, '?view=WordFinderGame&param=' + tag)
                    );
                }
            }
            else if (this._game == "MemoryGame") {

                /*this._actions.addRange([
                    new ImageActionItemViewModel('memory', 'assets/dashboard/random-thumbnail.svg', 'random_memory', 'Start a random memory game', '?view=MemoryGame'),
                ]);*/

                //Add puzzles
                var memory = gameData.memory;
                var tags = new SmartArray<string>();
                for (var i = 0; i < memory.length; i++) {
                    var setting = memory[i] as { tags: string[], subject: string, images: string[] };

                    var setTag = setting.tags[0];
                    var thumbUrl = "assets/dashboard/memory-" + setTag + "-thumbnail.svg";
                    this._actions.push(
                        new ImageActionItemViewModel(setting.images.length + " " + this._app.TranslatorService.translate("Pairs"), thumbUrl, setTag, null, '?view=MemoryGame&param=' + setTag)
                    );
                }
            }
            else if (this._game == "InvadersGame") {
                //Add invader levels/waves
                var invaders = gameData.invaders;
                console.log(invaders);
                for (var i = 0; i < invaders.levels.length; i++) {
                    var levelSetting = invaders.levels[i];
                    var thumbUrl = "assets/dashboard/invaders-" + levelSetting.id + "-thumbnail.svg";
                    this._actions.push(
                        new ImageActionItemViewModel("level", thumbUrl, levelSetting.id, null, '?view=InvadersGame&param=' + i)
                    );
                }
            }
            else if (this._game == "StroopGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('marathon.desc', 'assets/dashboard/stroop-marathon-thumbnail.svg', 'marathon', 'Play 50 rounds', '?view=StroopGame&param=4'),
                    new ImageActionItemViewModel('endless.desc', 'assets/dashboard/stroop-endless-thumbnail.svg', 'endless', 'Play as long as you can', '?view=StroopGame&param=0'),
                    new ImageActionItemViewModel('difficult.desc', 'assets/dashboard/stroop-difficult-thumbnail.svg', 'difficult', 'Play a difficult Stroop test', '?view=StroopGame&param=5'),
                    new ImageActionItemViewModel('shuffle.desc', 'assets/dashboard/random-thumbnail.svg', 'shuffle', 'Play a random Stroop test', '?view=StroopGame&param=6'),
                ]);
            }
            else if (this._game == "BreathingGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('6-6.desc', 'assets/dashboard/breathing-thumbnail.png', '6-6', 'A simple breathing test', '?view=SimpleBreathingGame&param=simple'),
                    new ImageActionItemViewModel('8-8.desc', 'assets/dashboard/breathing-thumbnail.png', '8-8', 'A slower simple breathing test for practice', '?view=SimpleBreathingGame&param=simple_slower'),
                    new ImageActionItemViewModel('4-7-8.desc', 'assets/dashboard/mountain-thumbnail.png', '4-7-8', 'An advanced breathing test', '?view=BreathingGame&param=standard'),
                    new ImageActionItemViewModel('4-7-8-fast.desc', 'assets/dashboard/mountain-thumbnail.png', '4-7-8-fast', 'A faster version of the advanced breathing test for practice', '?view=BreathingGame&param=standard_faster'),
                ]);
            }
            else if (this._game == "ReactionGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('reaction.simple.desc', 'assets/dashboard/reaction-simple-thumbnail.svg', 'reaction.simple', 'One Button', '?view=ReactionGame'),
                    new ImageActionItemViewModel('reaction.advanced.desc', 'assets/dashboard/reaction-advanced-thumbnail.svg', 'reaction.advanced', 'Four Buttons', '?view=ReactionGame&param=FourButton'),
                ]);
            }
            else if (this._game == "SudokuGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('Sudoku', 'assets/dashboard/sudoku-easy.svg', 'sudoku.easy', 'Easy', '?view=SudokuGame&param=35'),
                    new ImageActionItemViewModel('Sudoku', 'assets/dashboard/sudoku-normal.svg', 'sudoku.normal', 'Normal', '?view=SudokuGame&param=30'),
                    new ImageActionItemViewModel('Sudoku', 'assets/dashboard/sudoku-hard.svg', 'sudoku.hard', 'Hard', '?view=SudokuGame&param=25'),
                ]);
            }
            else if (this._game == "PongGame") {
                var pong = gameData.pong.gamemode;
                var gamemodes = new SmartArray<string>();
                for (var i = 0; i < pong.length; i++) {
                    var gamemode = pong[i] as { name: string, gamerules: string, };
                    if (gamemode.name) {
                        gamemodes.add(gamemode.name);
                    }
                }

                for (var i = 0; i < gamemodes.length; i++) {
                    var gamemode_name = gamemodes[i];

                    //var thumbUrl = "assets/dashboard/pong-" + gamemode.name + "-thumbnail.svg";
                    var thumbUrl = "assets/dashboard/pong-thumbnail.png"; //Placeholder image
                    this._actions.push(
                        new ImageActionItemViewModel("Pong ", thumbUrl, gamemode_name, null, '?view=PongGame&param=' + gamemode_name)
                    );
                }
            }
            else if (this._game == "BreakoutGame") {
                var breakout = gameData.breakout.level;
                var levels = new SmartArray<string>();
                for (var i = 0; i < breakout.length; i++) {
                    var level = breakout[i] as {name: string, width: number, height: number, border: {}, bricks: [] };
                    if (level.name) {
                        levels.add(level.name);
                    }
                }

                for (var i = 0; i < levels.length; i++) {
                    var level_name = levels[i];

                    var thumbUrl = "assets/dashboard/breakout-thumbnail.png"; //Placeholder image
                    this._actions.push(
                        new ImageActionItemViewModel("Breakout ", thumbUrl, level_name, null, '?view=BreakoutGame&param=' + level_name)
                    );
                }
            }
            else if (this._game == "HangmanGame") {
                this._actions.addRange([
                    new ImageActionItemViewModel('hangman', 'assets/dashboard/sudoku-easy.svg', 'sudoku.easy', 'Easy', '?view=HangmanGame&param=0-20'),
                    new ImageActionItemViewModel('hangman', 'assets/dashboard/sudoku-normal.svg', 'sudoku.normal', 'Normal', '?view=HangmanGame&param=20-40'),
                    new ImageActionItemViewModel('hangman', 'assets/dashboard/sudoku-hard.svg', 'sudoku.hard', 'Hard', '?view=HangmanGame&param=40-1000'),
                ]);
            }

            this._timerInterval = setInterval(() => {
                updateTime();
            }, 1000);

            callback(this);
        });
    }

    public remove() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
        }
    }
}
