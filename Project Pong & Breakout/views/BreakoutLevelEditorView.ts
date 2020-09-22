class BreakoutLevelEditorView extends BaseView {
    private _gamemode: string | number;
    protected running: boolean;

    private viewModel: BreakoutLevelEditorViewModel;

    private _assets: { [key: string]: HTMLImageElement } = {};

    private _handPositions = new SmartArray<{ id: string, x: number, y: number, time: number, moving: boolean }>();
    protected _inputControllers: SmartArray<UserControls> = null;
    protected canvas: HTMLCanvasElement;
    protected sidebar: HTMLDivElement;
    private resizeWindow;
    private _keyMouseCallback: (e: JQueryMouseEventObject, other: any) => void;
    protected mainMenuItem: GroupedTextItemViewModel;

    private _feedback: {
        //the pose or action done
        pose: string,
        //total time available for the feedback to remember
        maxTime: number,
        //time left for the feedback
        time: number
    }[] = [];

    public window = {
        w: 0,
        s: 0,
        playAreaX: 0,
        playAreaY: 0,
        offsetX: 0,
        offsetY: 0,
        gridXWidth: 0,
        gridYHeight: 0
    };

    public cursor: Vector2 = new Vector2(0, 0);

    public roundActive: boolean = false;
    public gameActive: boolean = false;
    public gameReady: boolean = true;
    public AIStartsRound: boolean = true;
    public BottomBorderExpiringTime: Date = new Date(Date.now());

    public constructor(app: R4HealApp, params: string) {
        super(app, "BreakoutLevelEditor");

        this._gamemode = params;
    }

    protected GetViewModel() {
        var app = this.app as AppGame;
        return BreakoutLevelEditorViewModel.Create(app, this._gamemode);
    }

    //Contains required variables for keyboard and mouse input
    public inputs = {
        last: "keyboard",
        left: false,
        up: false,
        right: false,
        down: false,
        cursor: new Vector2(0, 0.5),
        click: false,
        eraser: false
    };

    public ResizeWindow() {
        this.window.w = window.innerWidth * 0.8 > window.innerHeight ? window.innerHeight : window.innerWidth * 0.8;
        this.window.s = this.window.w / 2160;

        var padding = 0.05 * this.window.w;

        this.window.playAreaX = window.innerWidth * 0.95 - padding * 2;
        this.window.playAreaY = this.window.w - padding * 2;
        this.window.playAreaX = this.window.playAreaX > this.window.playAreaY ? this.window.playAreaY : this.window.playAreaX;
        this.window.playAreaY = this.window.playAreaY > this.window.playAreaX ? this.window.playAreaX : this.window.playAreaY;

        this.window.offsetX = window.innerWidth * 0.2;
        this.window.offsetY = (window.innerHeight - this.window.playAreaY) / 2;

        this.window.gridXWidth = this.window.playAreaX / this.viewModel.gridWidth;
        this.window.gridYHeight = this.window.playAreaY / this.viewModel.gridHeight;
    }

    public RemoveBrick(position_par: Vector2) {
        var x = Math.floor(position_par.x * this.viewModel.brickRatio) - (this.viewModel.brickRatio - this.viewModel.brickColumns) / 2;
        var y = Math.floor((1 - position_par.y) * this.viewModel.brickRatio) - this.viewModel.level.border.bottom;
        this.viewModel.level.bricks.forEach(function (brickTemplate) {
            if (typeof(brickTemplate.positions[y]) != "undefined") {
                if (brickTemplate.positions[y].contains(x)) {
                    brickTemplate.positions[y].remove(x);
                }
            }
        })
    }

    public PlaceBrick(position_par: Vector2) {
        this.RemoveBrick(position_par);
        var x = Math.floor(position_par.x * this.viewModel.brickRatio) - (this.viewModel.brickRatio - this.viewModel.brickColumns) / 2;
        var y = Math.floor((1 - position_par.y) * this.viewModel.brickRatio) - this.viewModel.level.border.bottom;

        var selectedBrick = this.viewModel.level.getSelectedBrick;
        if (typeof (selectedBrick.positions[y]) != "undefined" && x >= 1 && x <= this.viewModel.level.width) {
            selectedBrick.positions[y].add(x);
        }
    }

    //used to check if a new value is set
    public prev = {
    width: 0,
    height: 0,
    borderTop: 0,
    borderRight: 0,
    borderBottom: 0,
    borderLeft: 0
    }

    //if changes are made to the width, height and/or border, this method will handle the necessary methods for the right outcome
    public ManageLevelProperties() {
        if (this.prev.width != this.viewModel.level.Width ||
            this.prev.height != this.viewModel.level.Height ||
            this.prev.borderTop != this.viewModel.level.border.Top ||
            this.prev.borderRight != this.viewModel.level.border.Right ||
            this.prev.borderBottom != this.viewModel.level.border.Bottom ||
            this.prev.borderLeft != this.viewModel.level.border.Left) {
            
            //height increased
            if (this.prev.height < this.viewModel.level.Height) {
                var diffY = this.viewModel.level.Height - this.prev.height;
                this.viewModel.level.bricks.forEach(function (brickTemplate) {
                    for (var i = diffY; i > 0; i--) {
                        brickTemplate.positions.add(new ObservableArray<number>());
                    }
                })
            }

            //height decreased
            if (this.prev.height > this.viewModel.level.Height) {
                var diffY = this.prev.height - this.viewModel.level.Height;
                this.viewModel.level.bricks.forEach(function (brickTemplate) {
                    for (var i = diffY; i > 0; i--) {
                        brickTemplate.positions.pop();
                    }
                })
            }
        }
        this.prev.height = this.viewModel.level.Height;
        this.prev.width = this.viewModel.level.Width;
        this.prev.borderTop = this.viewModel.level.border.Top;
        this.prev.borderRight = this.viewModel.level.border.Right;
        this.prev.borderBottom = this.viewModel.level.border.Bottom;
        this.prev.borderLeft = this.viewModel.level.border.Left;

        this.viewModel.Reload();
        this.ResizeWindow();

    }

    public init(): Promise<void> {
        var arr = location.href.split('?');

        var navData = {
            view: this.Name
        } as HistoryItem;
        if (typeof this._gamemode !== "undefined") {
            navData.param = this._gamemode;
        }
        this.app.History.addOrUpdate(navData);

        var app = this.app as R4HealApp;

        var loadAsset = (name: string, src?: string) => {
            return new Promise<void>((resolved, rejected) => {
                var img = new Image();
                img.onload = () => {
                    this._assets[name.toLowerCase()] = img;
                    resolved();
                };
                img.onerror = rejected;
                img.src = src || "assets/breakout/" + name + ".png";
            });
        }

        var loadBrickAsset = () => {
            return new Promise<void>((resolved, rejected) => {
                for (let item in BreakoutBrickColor) {
                    if (isNaN(Number(item))) {

                        var i = 1;
                        while (i <= 3) {
                            var brick = item + i;
                            var img = new Image();
                            this._assets[brick] = img;

                            img.onerror = rejected;
                            img.src = "assets/breakout/bricks/" + brick + ".png";
                            i++;
                        }
                    }
                } resolved();
            });
        }

        return Promise.all([
            BreakoutLevelEditorViewModel.Create(app, this._gamemode).then((viewModel) => {
                var types = [];
                for (var i = 0; i < viewModel.entities.length; i++) {
                    var entityType = viewModel.entities[i].ClassType;
                    if (types.indexOf(entityType) == -1 && entityType != "brick")
                        types.push(entityType);
                }

                var assets: Promise<any>[] = [];
                for (var i = 0; i < types.length; i++) {
                    var asset = "assets/breakout/" + types[i] + ".png";
                    assets.push(loadAsset(types[i], asset));
                }

                return Promise.all(assets).then(() => { return viewModel; });
            }),
            this.app.ViewLoader.getView("breakoutLevelEditor"),
            loadAsset("ball"),
            loadAsset("ballBoosted"),
            loadAsset("paddle"),
            loadAsset("powerup"),
            loadBrickAsset()
        ]).then((results) => {
            var viewModel = this.viewModel = results[0];
            var view = results[1];

            this.prev.height = this.viewModel.level.Height;
            this.prev.width = this.viewModel.level.Width;
            this.prev.borderTop = this.viewModel.level.border.Top;
            this.prev.borderRight = this.viewModel.level.border.Right;
            this.prev.borderBottom = this.viewModel.level.border.Bottom;
            this.prev.borderLeft = this.viewModel.level.border.Left;

            //attaches keyboard and mouse event to the canvas
            //sets values in this.input based on the what is active
            $(window).on("keyup", (e) => {
                this.inputs.last = "keyboard";
                if (e.which == 37) { //arrowLeft
                    this.inputs.left = false;
                }
                if (e.which == 38) { //arrowUp
                    this.inputs.up = false;
                }
                if (e.which == 39) { //arrowRight
                    this.inputs.right = false;
                }
                if (e.which == 40) {//arrowDown
                    this.inputs.down = false;
                }
            }).on("keydown", (e) => {
                this.inputs.last = "keyboard";
                if (e.which == 37) { //arrowLeft
                    this.inputs.left = true;
                }
                if (e.which == 38) { //arrowUp
                    this.inputs.up = true;
                }
                if (e.which == 39) { //arrowRight
                    this.inputs.right = true;
                }
                if (e.which == 40) {//arrowDown
                    this.inputs.down = true;
                }
            }).on("mousemove", (e) => {
                this.inputs.cursor.x = (e.clientX - this.window.offsetX) / this.window.playAreaX;
                this.inputs.cursor.y = (e.clientY - this.window.offsetY) / this.window.playAreaY;
                this.inputs.last = "cursor";
                if (this.inputs.click) {
                    if (this.inputs.eraser) {
                        this.RemoveBrick(this.inputs.cursor);
                    } else {
                        this.PlaceBrick(this.inputs.cursor);
                    }
                }
            }).on("mousedown ", (e) => {
                this.inputs.click = true;
                this.inputs.last = "cursor";
                if (this.inputs.eraser) {
                    this.RemoveBrick(this.inputs.cursor);
                } else {
                    this.PlaceBrick(this.inputs.cursor);
                }
            }).on("mouseup ", (e) => {
                this.inputs.click = false;
                this.inputs.last = "cursor";
            });

            $(window).on("keyup", (e) => {
                this.inputs.last = "keyboard";
                if (e.which == 37) { //arrowLeft
                    this.inputs.left = false;
                }
                if (e.which == 38) { //arrowUp
                    this.inputs.up = false;
                }
                if (e.which == 39) { //arrowRight
                    this.inputs.right = false;
                }
                if (e.which == 40) {//arrowDown
                    this.inputs.down = false;
                }
            })

            this.container.html(view);

            var assets = this._assets;
            this.viewModel.level.bricks.forEach(function (entity) {
                entity.asset = assets[entity.color + entity.health];
            })

            this.app.BindManager.bind(viewModel, this.container);
            this._inputControllers = InputControllers.create(this.container, this.viewModel);

            //subscribes the menu items to the changed event
            var mainMenuItem = this.viewModel.Actions[0] as GroupedTextItemViewModel;
            for (var i = 0; i < mainMenuItem.children.length; i++) {
                var action = mainMenuItem.children[i];
                action.subscribe("changed", (caller, data) => {
                    this.gameActive = false;
                    if (data.property == "Selected" && caller instanceof ActionItemViewModel) {
                        if (caller.Endpoint) {
                            $(document.createElement("a")).attr("href", caller.Endpoint)[0].click();
                        }
                        else if (caller.Name == "new" || caller.Name == "restart") {
                            if (this._gamemode) {
                                this.navigate(this.Name + "View", this._gamemode);
                            }
                            else {
                                this.navigate(this.Name + "View");
                            }
                        }
                        else if (caller.Name == "exit" || caller.Name == "quit") {
                            this.navigate(MenuView);
                        }
                        else if (caller.Name == "continue" || caller.Name == "game" || caller.Name == "return") {
                            if (this.viewModel.Completed != 0 && this.viewModel.ToComplete == 0) {
                                if (this._gamemode) {
                                    this.navigate(this.Name + "View", this._gamemode);
                                }
                                else {
                                    this.navigate(this.Name + "View");
                                }
                            } else {
                                for (var i = 0; i < this._inputControllers.length; i++) {
                                    this._inputControllers[i].reset([0]);
                                }
                            }
                            this.gameActive = true;
                            if (this.viewModel.Completed > 0 && this.viewModel.ToComplete == 0) {
                                this.viewModel.StartNewRound();

                                history.replaceState({ view: this.Name }, this.Name, arr[0] + "?view=" + this.Name + "&param=" + this._gamemode);
                            }
                        }
                    }
                });
            }

            this.canvas = $("#canvas_container canvas", this.container)[0] as HTMLCanvasElement;
            this.sidebar = $("#sidebar", this.container)[0] as HTMLDivElement;

            var callbackDisableEraser = function() {
                var eraserElement = $("#eraser")[0] as HTMLButtonElement;
                eraserElement.style.borderStyle = "outset";
            }

            //due to an unkown reason html elements can't be clicked on to select,  so a custom event handler is made
            //only works with input elements
            this.container.on("click", ".inputText", function (e) {
                (e.target as HTMLInputElement).select();
            });

            var viewModel = this.viewModel;

            //if clicked on a brickTemplate, this method sets it as the selected template
            this.container.on("click", ".templateImg", function (e) {
                var element = (e.target as HTMLImageElement);
                for (i = 0; i < e.target.parentNode.parentNode.parentNode.children.length; i++) {
                    var sibling = e.target.parentNode.parentNode.parentNode.children[i].children[0].children[0] as HTMLImageElement;
                    if (sibling.style.borderWidth == "2px") {
                        sibling.style.width = sibling.width + 4 + "px";
                    }
                    sibling.style.borderWidth = "0px";
                }
                element.style.width = element.width - 4 + "px";
                element.style.borderWidth = "2px";
                var id = parseInt(element.parentNode.children[1].textContent);
                var selectedBrick = (viewModel.level.bricks.find((entity) => entity.id == id));
                viewModel.level.bricks.forEach(function (entity) {
                    entity.selected = false;
                });
                selectedBrick.selected = true;
                viewModel.level.RefreshSelectedBrickBind();
                inputs.eraser = false;
                callbackDisableEraser();
            });
            var inputs = this.inputs;
            //toggles an eraser
            this.container.on("click", "#eraser", function (e) {
                var element = (e.target as HTMLButtonElement);
                inputs.eraser = !inputs.eraser;
                if (inputs.eraser) {
                    element.style.borderStyle = "inset";
                } else {
                    callbackDisableEraser();
                }
            });

            var canvas = $(this.canvas);
            canvas.attr({
                "height": canvas.height(),
                "width": canvas.width()
            });
            this.resizeWindow = () => {
                canvas.attr({
                    "height": canvas.height(),
                    "width": canvas.width()
                });
                this.ResizeWindow();
            };

            $(window).add($(document)).add($("canvas")).on("resize", this.resizeWindow);
            this.ResizeWindow();

            //subscribes viewmodel to the finished event to end the game
            this.mainMenuItem = this.viewModel.Actions[0] as GroupedTextItemViewModel;
            this.viewModel.subscribe("finished", (caller, data) => {
                this.viewModel.Actions.add(mainMenuItem);
                for (var i = 0; i < this._inputControllers.length; i++) {
                    this._inputControllers[i].reset([this.viewModel.Actions.indexOf(this.mainMenuItem), Math.round((this.mainMenuItem.children.length - 1) / 2)]);
                }

                var scoringType = 'score' in data ? "score" : "time";
                setTimeout(() => {
                    var transformTime = (time: number) => {
                        var deciseconds: string | number = Math.floor(time * 10) % 10;
                        var seconds: string | number = Math.floor(time) % 60;
                        var minutes: string | number = Math.floor(time / 60) % 60;
                        var hours: string | number = Math.floor(time / 3600);

                        if (hours < 10) hours = "0" + hours;
                        if (minutes < 10) minutes = "0" + minutes;
                        if (seconds < 10) seconds = "0" + seconds;

                        if (hours > 0)
                            return hours + ":" + minutes + ":" + seconds;
                        else
                            return minutes + ":" + seconds + "." + deciseconds;
                    };

                    var gameEndContainer = $(".game-end." + (data.victory !== false ? "victory" : "loss") + "." + scoringType, this.container).addClass("show").removeClass("hide");
                    $("span." + scoringType, gameEndContainer).text(scoringType == "time" ? transformTime(data[scoringType] || this.viewModel.PlaytimeMs / 1000) : Math.floor(data[scoringType] * 100) / 100);
                    $("menu.mainmenu > h1", this.container).addClass("hide").removeClass("show");
                }, 250);
            });

            var lastTime: ITime = null;
            this.running = true;

            //loop that runs as long as the game is active
            var run = (timestamp) => {
                var diff = lastTime ? timestamp - lastTime.time : 0;
                lastTime = {
                    elapsedTime: diff,
                    sessionTime: lastTime ? lastTime.sessionTime + diff : 0,
                    time: timestamp
                };

                this.ManageLevelProperties();

                this._RenderCanvas(lastTime);

                if (this.running) {
                    try {
                        requestAnimationFrame(run);
                    }
                    catch (e) {

                    }
                }
            };
            requestAnimationFrame(run);

            this.viewModel.subscribe("success", (caller, data) => {
                if (data && data.pose) {
                    this._feedback.push({
                        pose: data.pose,
                        maxTime: 1000,
                        time: 1000
                    });
                }
            });

            //Track hands
            var keyMouseCallback = this._keyMouseCallback = (e, other: {
                Player: string,
                Type: string,
                Position: Vector2,
                Depth: number
            }) => {
                var id = null;
                if (other && other.Position) {
                    e.pageX = other.Position.x;
                    e.pageY = other.Position.y;
                    id = "kinect:" + other.Player + ":" + other.Type;
                }

                var hand = this._handPositions.find(p => p.id == id);
                if (!hand) {
                    //console.log("Kinect move detected:", id);
                    hand = {
                        id: id,
                        x: 0,
                        y: 0,
                        time: 0,
                        moving: false
                    };
                    this._handPositions.add(hand);
                }
                else {
                    var moveSpeed = (Date.now() - hand.time) / 1000;
                    hand.moving = Math.abs(hand.x - e.pageX) > moveSpeed * 500 ||
                        Math.abs(hand.y - e.pageY) > moveSpeed * 500;
                }
                hand.x = e.pageX;
                hand.y = e.pageY;
                hand.time = Date.now();
            };
            $(window).on("mousemove kinectmove touchmove", keyMouseCallback);
        });
    }

    //renders canvas in which everything else get rendered
    private _RenderCanvas(time: ITime): void {
        if (this.running) {
            this.viewModel.update(time);

            //Prepare render updates
            var canvas = ($("canvas")[0] as HTMLCanvasElement);
            var context = canvas.getContext("2d");

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            //Render
            context.save();
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            this._Render(context, time);

            context.restore();

            //remove inactive hands
            for (var i = this._handPositions.length - 1; i >= 0; i--) {
                if (this._handPositions[i].time + 250 < Date.now()) {
                    this._handPositions.splice(i, 1);
                }
            }
        }
    }

    //renders entities in the canvas
    protected _Render(context: CanvasRenderingContext2D, time: ITime): void {
        //update active feedback
        for (var i = this._feedback.length - 1; i >= 0; i--) {
            var feedback = this._feedback[i];
            feedback.time -= time.elapsedTime;
            if (feedback.time < 0) {
                this._feedback.splice(i, 1);
            }
        }

        var viewModel = this.viewModel;
        var window = this.window;
        var assets = this._assets;

        var w;
        var h;

        var offsetX = (viewModel.brickRatio - viewModel.brickColumns) / 2;
        var offsetY = (viewModel.brickRatio - viewModel.brickRows) / 2;
        this.viewModel.level.bricks.forEach(function (brickTemplate) {//for every bricktemplate
            var i = 0;//bricktemplate counter
            brickTemplate.positions.forEach(function (y2) {//for every row in this bricktemplate
                var i2 = 0;//brickRow counter
                y2.forEach(function () {//for every x position in this row in this bricktemplate
                    var x = ((viewModel.level.border.Left / 2 + y2[i2] + offsetX) / (viewModel.brickRatio));
                    var y = 1 - ((i + viewModel.level.border.Bottom + 0.5 + offsetY) / (viewModel.brickRatio));
                    
                    var image = assets[brickTemplate.color + brickTemplate.health];

                    w = window.playAreaX / viewModel.brickRatio;
                    h = window.playAreaY / viewModel.brickRatio;
                    
                    if ('isloading' in image == false) {
                        var offsetX2 = window.offsetX + x * window.gridXWidth;
                        var offsetY2 = window.offsetY + y * window.gridYHeight;

                        context.drawImage(image, offsetX2 - w / 2, offsetY2 - h / 2, w, h);
                    }

                    i2++;
                })
                i++;
            })
        })


        for (var i = 0; i < this.viewModel.brickRatio; i++) {
            
        }

        //borders
        context.fillStyle = "#7df9ff";
        context.fillRect(this.window.offsetX - 0.05 * this.window.w, 0, this.window.playAreaX + 0.1 * this.window.w, 0.05 * this.window.w);//top border
        context.fillRect(this.window.offsetX - 0.05 * this.window.w, 0, 0.05 * this.window.w, this.window.playAreaY + 0.1 * this.window.w);//left border
        context.fillRect(this.window.offsetX + this.window.playAreaX, 0, 0.05 * this.window.w, this.window.playAreaY + 0.1 * this.window.w);//right border
        context.fillRect(this.window.offsetX - 0.05 * this.window.w, this.window.playAreaY + 0.05 * this.window.w, this.window.playAreaX + 0.1 * this.window.w, 0.05 * this.window.w);//bottom border

        
        //grid - helps when placing or removing bricks
        var offsetborders = {
            top: 0,
            left: 0,
        };
        offsetborders.left = window.playAreaX * (((viewModel.brickRatio - viewModel.brickColumns) / 2 + viewModel.level.border.Left) / viewModel.brickRatio);
        offsetborders.top = window.playAreaY * (((viewModel.brickRatio - viewModel.brickRows) / 2 + viewModel.level.border.Top) / viewModel.brickRatio);
        var width = window.playAreaX * (viewModel.level.width / viewModel.brickRatio); //width of the horizontal lines
        var height = window.playAreaY * (viewModel.level.height / viewModel.brickRatio); //height of the vertical lines
        //grid horizontal lines
        for (var i = viewModel.level.border.Top; i < this.viewModel.brickRows - viewModel.level.border.Bottom + 1; i++) {
            context.fillStyle = "#000000";
            context.fillRect(window.offsetX + offsetborders.left, 0.05 * window.w + i * (window.playAreaY / viewModel.brickRatio), width, 1);
        }
        //grid vertical lines
        for (var i = viewModel.level.border.Left - 1; i < this.viewModel.brickColumns - viewModel.level.border.Right; i++) {
            context.fillStyle = "#000000";
            context.fillRect(window.offsetX + offsetborders.left + i * (window.playAreaX / viewModel.brickRatio), window.offsetY + offsetborders.top, 1, height);
        }
    }
}