interface IBreakoutLevel {
    name: string;
    border: {
        top: number,
        right: number,
        bottom: number,
        left: number
    };
    width: number;
    height: number;
    bricks: Array<IBreakoutBrick>;
}

interface IBreakoutBrick {
    color: BreakoutBrickColor;
    health: number;
    points: number;
    //drop: BreakoutPowerupType;
    positions: Array<IBreakoutBrickRow>;
}

interface IBreakoutBrickRow {
    Y: Array<number>;
}

class BreakoutGameViewModel extends BasePlacePuzzleViewModel {
    public static Create(app: AppGame, param: string | number) {
        return new Promise<BreakoutGameViewModel>((resolve, reject) => {
            new BreakoutGameViewModel(app, param, (viewModel) => {
                resolve(viewModel);
            });
        });
    }

    public constructor(app: AppGame, param: string | number, callback) {
        super(app.ThemeManager, app.SceneManager, app.StatisticsManager);
        this._level = param as string;
        this.app = app;
        app.GameSaveData.isInitialized().then(() => {
            this._loadLevels().then(() => {
                this.init(callback);
            });
        });
        window["model"] = this;
    }

    public brickRows: number;
    public brickColumns: number;
    public brickRatio: number;

    private _level: string;
    public levels: IBreakoutLevel[];
    private _levels: IBreakoutLevel[];

    //gets gamedata from loaded gamedata
    private _loadLevels(): Promise<void> {
        return new Promise<void>((resolved, rejected) => {
            var gameData = this.app.GameSaveData.SaveData['data'];
            var levels = gameData['breakout'];
            if (!levels) {
                rejected(new Error("No breakout data found to load"));
            }
            else {
                this._levels = levels.level;
                resolved();
            }
        });
    }

    //optimization - better naming of variables inside this method
    public StartNewRound(): Promise<void> {
        this._field = new BreakoutField();

        this._field.entities.add(new BreakoutPaddle(new Vector2(0.5, 1.0), 10));
        this._field.entities.add(new BreakoutBall(new Vector2(0.5, 0.9), 0, 5, 2));

        var idx = Number(this._level);
        var level: IBreakoutLevel;
        if (typeof this._level == 'string' && isNaN(idx)) {
            var level_temp = this._levels.filter(p => p.name == this._level);
            idx = Math.floor(Math.random() * level_temp.length);
            level = level_temp[idx];
        }
        else {
            if (isNaN(idx)) {
                idx = Math.floor(Math.random() * this._levels.length);
            }
            level = this._levels[idx];
        }

        var brickRows = level.height + level.border.top + level.border.bottom;
        var brickColumns = level.width + level.border.right + level.border.left;
        var brickRatio = brickRows > brickColumns ? brickRows : brickColumns;

        this.brickRows = brickRows;
        this.brickColumns = brickColumns;
        this.brickRatio = brickRatio;

        var field = this._field;
        level.bricks.forEach(function (bricktype) {
            var i = 0;
            bricktype.positions.forEach(function (row) {
                var rowI = 0;
                while (typeof (row[rowI]) != "undefined") {
                    var x = ((level.border.left + row[rowI] + (level.border.bottom / 2)) / (brickRatio - 0.5));
                    var y = 1 - ((level.border.left + i + level.border.bottom) / (brickRatio - 0.5));
                    var brick = new BreakoutBrick(new Vector2(x, y), bricktype.health, bricktype.points, bricktype.color, BreakoutPowerupType.none);
                    field.entities.add(brick);
                    rowI++;
                }
                i++;
            });
        });
        
        return Promise.resolve();
    }
    public updateInternal(time: ITime) {
        this.timeSinceLastModeSwap += time.elapsedTime;
        this.timeSinceLastUpdate += time.elapsedTime;
    }

    public get Completed(): number { return this.completed; }
    private completed: number = 0;
    public get ToComplete(): number { return this.toComplete; }
    private toComplete: number = 0;

    public get GameName(): string { return "Breakout"; }
    private app: AppGame;

    private _gridWidth = 1;
    public get gridWidth() { return this._gridWidth; };

    private _gridHeight = 1;
    public get gridHeight() { return this._gridHeight; }

    private _field: BreakoutField;
    public get entities() { return this._field.entities; }
    
    public ClearMessages() {
        this._field.messages.clear();
    }

    public get message() { return this._field.CurrentMessageGet(); }
    //adds a message that is displayed in the middle of the screen that pauses the game
    public messageAdd(text_par: string, duration_par: number) {
        var message = new ScreenMessage(text_par, duration_par);
        if (this._field.messages.count() === 0) {
            message.SetExpireTimer();
        }
        this._field.messages.add(message);
    }

    public get CurrentPoints(): number { return this._field.points; }
    public AddPoints(points_par: number) { this._field.AddPoints(points_par)}

    //returns the distance of the skeleton on a scale of 0 to 1
    public Skeleton() {
        var app = this.app as R4HealApp;
        if (typeof (app.PoseService.Skeleton) != "undefined") {
            var distance = app.PoseService.Skeleton.Joints.find((i) => i.Type == "MidSpine").WorldPosition['X'];

            if (distance < -300) {
                distance = -300;
            }
            if (distance > 300) {
                distance = 300;
            }

            return (distance + 300) / 600;
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

    public GameEnd(victory_par: boolean) {
        this.completed++;
        this.trigger("finished", { victory: victory_par, time: this.PlaytimeMs / 1000 });
    }

    private _direction: number = 0;
    public set Direction(newValue) { this._direction = newValue; }
    public get Direction() { return this._direction; }

    private timeSinceLastModeSwap;
    private timeSinceLastUpdate;
    private PencilMarkMode;
}