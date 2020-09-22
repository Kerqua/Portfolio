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

class BreakoutLevelEditorViewModel extends BasePlacePuzzleViewModel {
    public static Create(app: AppGame, param: string | number) {
        return new Promise<BreakoutLevelEditorViewModel>((resolve, reject) => {
            new BreakoutLevelEditorViewModel(app, param, (viewModel) => {
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

    public brickRows: number; //number of bricks rows including border
    public brickColumns: number; //number of bricks columns including border
    public brickRatio: number; //same brickRows or brickColum depending on which one is the highest
    //brickRatio is an important variable used to calculate canvas position (0 to 1) to gamedata position (whole numbers up to the same value as the width)
    
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

    public level: BreakoutLevel;
    public get Sidebar() { return this.level; }

    //recalculates brickRows, brickColumns and brickRatio
    public Reload() {
        this.brickRows = this.level.Height + this.level.border.Top + this.level.border.Bottom;
        this.brickColumns = this.level.Width + this.level.border.Right + this.level.border.Left;
        this.brickRatio = this.brickRows > this.brickColumns ? this.brickRows : this.brickColumns;
    }

    public StartNewRound(): Promise<void> {
        this._field = new BreakoutField();

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

        var brickTemplates = new ObservableArray<BreakoutBrickTemplate>();

        var field = this._field;
        var I_ph = 0;
        level.bricks.forEach(function (bricktype) {
            var i = 0;
            brickTemplates.add(new BreakoutBrickTemplate(I_ph, bricktype.color, bricktype.health, bricktype.points));
            bricktype.positions.forEach(function (row) {
                brickTemplates[I_ph].positions.add(new ObservableArray<number>());
                var rowI = 0;
                while (typeof (row[rowI]) != "undefined") {
                    brickTemplates[I_ph].positions[i].add(row[rowI]);
                    var x = ((level.border.left + row[rowI] + (level.border.bottom / 2)) / (brickRatio));
                    var y = 1 - ((i + level.border.bottom + level.border.top - 0.5) / (brickRatio));
                    var brick = new BreakoutBrick(new Vector2(x, y), bricktype.health, bricktype.points, bricktype.color, BreakoutPowerupType.none);
                    field.entities.add(brick);
                    rowI++;
                }
                i++;
            });

            I_ph++;
        });
        this.level = new BreakoutLevel(level.name, level.border, level.width, level.height, brickTemplates);
        this.level.bricks[0].selected = true;

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