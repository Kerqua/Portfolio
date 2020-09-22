class ImageActionItemViewModel extends ActionItemViewModel {
    public get Category() { return this._category; }
    private _category: string;

    public get Image() { return this._image; }
    private _image: string;

    public get ImageType() { return this._imageType; }
    private _imageType: string;

    public constructor(category: string, image: string, name: string, description?: string, endpoint?: string) {
        super(name, description, endpoint);

        this._image = image;
        this._category = category;
        this._imageType = image.indexOf(".svg") >= 0 ? "svg" : "other";
    }
}

class MenuViewModel extends DataPropertyNotification {
    public static Create(app: R4HealApp): Promise<MenuViewModel> {
        return new Promise<MenuViewModel>((resolve, reject) => {
            new MenuViewModel(app, (viewModel) => {
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

    private _timerInterval: number = null;
    private constructor(app: R4HealApp, callback) {
        super();

        var has4Controls = true;
        var hasStepper = false;
        var isDeveloper = false;

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

            if (hasSkeleton) {
                this._actions.addRange([
                    new ImageActionItemViewModel('vitallity', 'assets/dashboard/growinggame-thumbnail.jpg', 'Grow', 'Grow a tree by moving about', '?view=GrowingGame'),
                    new ImageActionItemViewModel('vitallity', 'assets/dashboard/invadersgame-thumbnail.jpg', 'Invaders', 'Keep the invaders in space', '?view=SubMenu&param=InvadersGame')
                ]);
            }

            if (hasStepper) {
                this._actions.addRange([
                    new ImageActionItemViewModel('vitallity', 'assets/dashboard/birdclimber-thumbnail.jpg', 'Bird climber', 'Help birds climb up', '?view=StepperGame'),
                ]);
            }

            if (has4Controls) {
                //Add puzzles
                this._actions.addRange([
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/jigsaw-thumbnail.png'          , 'all jigsaws', 'Start the jigsaw puzzle game', '?view=SubMenu&param=JigsawGame'),
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/hangman-thumbnail.png', 'hangman', 'Start the hangman game', '?view=SubMenu&param=HangmanGame'),
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/wordfinder-thumbnail.png', 'word finder', 'Start the word finder game', '?view=SubMenu&param=WordFinderGame'),
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/sentencecompleter-thumbnail.png', 'sentence completer', 'Start the sentence completer game', '?view=SentenceCompleterGame'),
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/sudoku-thumbnail.png'          , 'sudoku', 'Start the sudoku game', '?view=SubMenu&param=SudokuGame'),
                    new ImageActionItemViewModel('puzzle', 'assets/dashboard/memory-thumbnail.png'          , 'memory', 'Start the memory game', '?view=SubMenu&param=MemoryGame'),
                    new ImageActionItemViewModel('action', 'assets/dashboard/stroop-thumbnail.png'          , 'stroop', 'Start the stroop game', '?view=SubMenu&param=StroopGame'),
                    //new ImageActionItemViewModel('action', 'assets/dashboard/tictactoe-thumbnail.jpg'     , 'tic tac toe', 'Start the hangman game', '?view=TicTacToeGame'),
                    new ImageActionItemViewModel('action', 'assets/dashboard/birdshooter-thumbnail.png'     , 'hunting', 'Start the bird shooter game', '?view=BirdShooterGame'),
                    new ImageActionItemViewModel('action', 'assets/dashboard/reaction-thumbnail.png', 'Reaction', 'A reaction test', '?view=SubMenu&param=ReactionGame'),
                    new ImageActionItemViewModel('relaxation', 'assets/dashboard/breathing-thumbnail.png', 'Breathing', 'Breathing exercises', '?view=SubMenu&param=BreathingGame'),
                    new ImageActionItemViewModel('action', 'assets/dashboard/pong-thumbnail.png', 'pong', 'Start the pong game', '?view=SubMenu&param=PongGame'),
                    new ImageActionItemViewModel('action', 'assets/dashboard/breakout-thumbnail.png', 'breakout', 'Start the breakout game', '?view=SubMenu&param=BreakoutGame'),
                ]);
            }

            this._actions.addRange([
                new ActionItemViewModel('settings', 'Change game and interface settings', '?view=Settings'),
            ]);

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
