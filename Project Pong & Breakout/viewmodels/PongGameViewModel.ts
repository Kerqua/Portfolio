interface Gamerules {
    ballSpeed: number;
    playerSpeed: number;
    AISpeed: number;
    boostMultiplier: number;
}

class PongGameViewModel extends BasePlacePuzzleViewModel {
    public static Create(app: AppGame, param: string | number) {
        return new Promise<PongGameViewModel>((resolve, reject) => {
            new PongGameViewModel(app, param, (viewModel) => {
                resolve(viewModel);
            });
        });
    }

    public constructor(app: AppGame, param: string | number, callback) {
        super(app.ThemeManager, app.SceneManager, app.StatisticsManager);
        this._gamemode = param as string;
        this.app = app;
        app.GameSaveData.isInitialized().then(() => {
            this._loadGamemodes().then(() => {
                console.log(this._gamemodes);
                this.init(callback);
            });
        });
        window["model"] = this;

    }

    private _gamemode: string;
    public gamemode: Gamemode;
    private _gamemodes: { name: string, gamerules: { } }[];

    //gets gamedata from loaded gamedata
    private _loadGamemodes(): Promise<void> {
        return new Promise<void>((resolved, rejected) => {
            var gameData = this.app.GameSaveData.SaveData['data'];
            var gamemode = gameData['pong'];
            if (!gamemode) {
                rejected(new Error("No pong data found to load"));
            }
            else {
                this._gamemodes = gamemode.gamemode;
                resolved();
            }
        });
    }

    //optimization - method based on wordfinder's StartNewRound(), some parts may be unnecessary
    public StartNewRound(): Promise<void> {
        var idx = Number(this._gamemode);
        var gamemode;
        if (typeof this._gamemode == 'string' && isNaN(idx)) {
            var gamemode_temp = this._gamemodes.filter(p => p.name == this._gamemode); //optimization - gamemode_temp should get a better name
            idx = Math.floor(Math.random() * gamemode_temp.length);
            gamemode = gamemode_temp[idx];
        }
        else {
            if (isNaN(idx)) {
                idx = Math.floor(Math.random() * this._gamemodes.length);
            }
            gamemode = this._gamemodes[idx];
        }
        var gamerules = gamemode.gamerules as Gamerules;

        this._field = new Field();

        var paddlePlayer = new PaddlePlayer(0, 100, new Vector2(0, 0.5), gamerules.playerSpeed);
        this._field.entities.add(paddlePlayer);

        var paddleAI = new PaddleAI(0, 100, new Vector2(1, 0.5), gamerules.AISpeed);
        this._field.entities.add(paddleAI);

        this.subscribe("spawnBall", (caller, data) => {
            var ball = new Ball(new Vector2(0.5, 0.5), 90, gamerules.ballSpeed, gamerules.boostMultiplier);
            this._field.entities.add(ball);
        });

        return Promise.resolve()
    }
    public updateInternal(time: ITime) {
        this.timeSinceLastModeSwap += time.elapsedTime;
        this.timeSinceLastUpdate += time.elapsedTime;
    }

    public get Completed(): number { return this.completed; }
    private completed: number = 0;
    public get ToComplete(): number { return this.toComplete; }
    private toComplete: number = 0;

    public get GameName(): string { return "Pong"; }
    private app: AppGame;

    private _gridWidth = 1;
    public get gridWidth() { return this._gridWidth; };

    private _gridHeight = 1;
    public get gridHeight() { return this._gridHeight; }

    private _field: Field;

    public get entities() { return this._field.entities; }

    public get message() { return this._field.CurrentMessageGet(); }

    //adds a message that is displayed in the middle of the screen that pauses the game
    public messageAdd(text_par: string, duration_par: number) {
        var message = new ScreenMessage(text_par, duration_par);
        if (this._field.messages.count() === 0) {
            message.SetExpireTimer();
        }
        this._field.messages.add(message);
    }

    //returns the distance of the skeleton on a scale of 0 to 1
    public Skeleton() {
        var app = this.app as R4HealApp;
        if (typeof (app.PoseService.Skeleton) != "undefined") {
            var distance = app.PoseService.Skeleton.Joints.find((i) => i.Type == "MidSpine").WorldPosition['Z'];

            if (distance < 1000) {
                distance = 1000;
            }
            if (distance > 2500) {
                distance = 2500;
            }

            return (distance - 1000) / 1500;
        } else {
            return false;
        }
    }

    //returns True if arms are up, otherwise it returns false
    //warn - NormalizedPosition is exactly the same as DepthPosition, assuming this is a bug -> this method will create problems if fixed
    public SkeletonArmsUp(): boolean {
        var app = this.app as R4HealApp;
        if (typeof (app.PoseService.Skeleton) != "undefined") {
            var leftHand = app.PoseService.Skeleton.Joints.find((i) => i.Type == "LeftHand").NormalizedPosition['Y'];
            var leftShoulder = app.PoseService.Skeleton.Joints.find((i) => i.Type == "LeftShoulder").NormalizedPosition['Y'];
            var rightHand = app.PoseService.Skeleton.Joints.find((i) => i.Type == "RightShoulder").NormalizedPosition['Y'];
            var rightShoulder = app.PoseService.Skeleton.Joints.find((i) => i.Type == "RightHand").NormalizedPosition['Y'];

            if (leftHand < leftShoulder && rightHand > rightShoulder) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private _direction: number = 0;
    public set Direction(newValue) { this._direction = newValue; }
    public get Direction() { return this._direction; }

    private timeSinceLastModeSwap;
    private timeSinceLastUpdate;
    private PencilMarkMode;

    //finishes the game
    public GameEnd(victory_par: boolean) {
        this.completed++;
        this.trigger("finished", { victory: victory_par, time: this.PlaytimeMs / 1000 });
    }

    //spawns a new ball
    public SpawnBall() {
        this.trigger("spawnBall", null);
    }
}