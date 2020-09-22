class PongGameView extends BaseView {
    private _gamemode: string | number;
    protected running: boolean;

    private viewModel: PongGameViewModel;

    private _assets: { [key: string]: HTMLImageElement } = {};

    private _handPositions = new SmartArray<{ id: string, x: number, y: number, time: number, moving: boolean }>();
    protected _inputControllers: SmartArray<UserControls> = null;
    protected canvas: HTMLCanvasElement;
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

    private _moveUp: boolean = false;
    private _moveDown: boolean = false;

    public cursor: Vector2 = new Vector2(0, 0);

    public roundActive: boolean = false;
    public gameActive: boolean = false;
    public gameReady: boolean = true;
    public AIStartsRound: boolean = true;

    public constructor(app: R4HealApp, params: string) {
        super(app, "PongGame");

        this._gamemode = params;
    }

    protected GetViewModel() {
        var app = this.app as AppGame;
        return PongGameViewModel.Create(app, this._gamemode);
    }

    //starts game and can only be called once. Called it more than once has no effect
    public Start() {
        if (this.gameReady) {
            this.gameActive = true;
            this.gameReady = false;
            this.viewModel.messageAdd("3", 500);
            this.viewModel.messageAdd("2", 500);
            this.viewModel.messageAdd("1", 500);
            this.viewModel.messageAdd("Go!", 500);
        }
    }

    //Contains required variables for keyboard and mouse input
    public inputs = {
        last: "none",
        left: false,
        up: false,
        right: false,
        down: false,
        cursor: new Vector2(0, 0.5),
        click: false
    };

    //Moves player based on input. MotionTracker and mouse input give a destination, keyboard gives a direction. 
    //MotionTracker input will be prioritized above keyboard or mouse input, keyboard input will be prioritized above mouse input
    private _MovePlayer(){
        var paddlePlayer = (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddlePlayer") as Paddle);
        var destination = new Vector2(paddlePlayer.position.x, paddlePlayer.position.y);

        var speed = paddlePlayer.maxSpeed / 1000;
        if (!this.inputs.right && !this.inputs.click && !this.viewModel.SkeletonArmsUp()) destination.x -= speed; //boost input inactive
        if (this.inputs.up) destination.y -= speed;
        if (this.inputs.right || this.inputs.click || this.viewModel.SkeletonArmsUp()) destination.x += speed; //boost input active
        if (this.inputs.down) destination.y += speed;
        
        if (this.viewModel.Skeleton()) {
            this.inputs.last = "motionTracker";
        }
        if (!this.inputs.right && !this.inputs.up && !this.inputs.left && !this.inputs.down && this.inputs.last != "keyboard") {
            if (this.inputs.last == "cursor") {
                var difference = (this.inputs.cursor.y - paddlePlayer.position.y) / 10;
            } else if (this.inputs.last == "motionTracker") {
                var difference = (this.viewModel.Skeleton() as number - paddlePlayer.position.y) / 10; 
            } else {
                new Error();
            }
            
            destination.y += (difference);
        }

        paddlePlayer.Move(destination);
    };

    //Moves the ball and checks if a point is scored
    private _MoveBall() {
        var ball = (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "ball") as Ball);
        var destination = new Vector2(ball.position.x, ball.position.y);

        destination.x += (Math.sin((ball.angle / 180) * Math.PI) * (ball.Speed() / 1000));
        destination.y += (Math.cos((ball.angle / 180) * Math.PI) * (ball.Speed() / 1000));

        var result = ball.Move(destination);
        switch (result) {
            case "paddlePlayerScored":
                this.RoundEnd((this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddlePlayer") as Paddle));
                break;
            case "paddleAIScored":
                this.RoundEnd((this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddleAI") as Paddle));
                break;
            default:
        }
        var inputs = this.inputs;
        var viewModel = this.viewModel;
        ball.SetHitbox(); //refresh hitbox
        this.viewModel.entities.forEach(function (entity) {
            entity.SetHitbox();
            if (ball.hitbox.CheckCollision(entity.hitbox) && entity.ClassType != "invisibleBall") {
                if ((entity as Paddle).isAI && ball.angle < 180) {
                    var angle = 270 - ((entity.position.y - ball.position.y) * 300) - ((ball.angle - 90) / 2);
                    ball.boost = false;
                    if (angle < 210) {
                        angle = 210;
                    }
                    if (angle > 330) {
                        angle = 330;
                    }
                    var invisibleBall = viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall") as InvisibleBall;
                    if (invisibleBall != undefined) {
                        viewModel.entities.remove(invisibleBall);
                    }
                } else if (!(entity as Paddle).isAI && ball.angle > 180) {
                    var angle = 90 + ((entity.position.y - ball.position.y) * 300) - ((ball.angle - 270) / 2);

                    if (angle < 30) {
                        angle = 30;
                    }
                    if (angle > 150) {
                        angle = 150;
                    }

                    if (entity.position.x < 0.1 && ((inputs.right && !inputs.down && !inputs.up) || (inputs.click) || (viewModel.SkeletonArmsUp()))) {
                        ball.boost = true;
                    }

                    var invisibleBall = new InvisibleBall((viewModel.entities.find((pongEntity) => pongEntity.ClassType == "ball") as Ball));
                    invisibleBall.angle = angle;
                    viewModel.entities.add(invisibleBall);
                } else {
                    var angle = ball.angle;
                }
                ball.angle = angle;
            }
        });
    }

    //moves AI up and down based on the Y position of the ball
    //if an invisible ball exist, AI will move toward it's Y position instead
    private _MoveAI() {
        var paddleAI = this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddleAI") as Paddle;
        var destination = new Vector2(paddleAI.position.x, paddleAI.position.y);

        var ball;
        if (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall")) {
            ball = (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall") as Ball);
        } else {
            ball = (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "ball") as Ball);
        }
        
        var heightDifference = paddleAI.position.y - ball.position.y;
        var speed = paddleAI.maxSpeed / 1000;

        if (heightDifference > 0) {
            if (heightDifference > speed) {
                destination.y -= speed;
            } else {
                destination.y -= heightDifference;
            }
        } else {
            if (heightDifference < -speed) {
                destination.y += speed;
            } else {
                destination.y -= heightDifference;
            }
        }
        paddleAI.Move(destination);
    }

    //moves the invisible ball, very similar to _MoveBall()
    //Stops if the left or right side of the field has been reached
    private _MoveInvisibleBall() {
        var ball = this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall") as InvisibleBall;
        var destination = new Vector2(ball.position.x, ball.position.y);
        destination.x += (Math.sin((ball.angle / 180) * Math.PI) * (ball.Speed() / 1000));
        destination.y += (Math.cos((ball.angle / 180) * Math.PI) * (ball.Speed() / 1000));

        ball.Move(destination);
    }

    //(re)sets variables and calls methods required to start a round
    public RoundStart() {
        this.roundActive = true;

        this.viewModel.SpawnBall();

        var ball = (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "ball") as Ball);
        ball.boost = false;

        var invisibleBall = this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall") as InvisibleBall;
        if (invisibleBall != undefined) {
            this.viewModel.entities.remove(invisibleBall);
        }

        //sets which paddle is the first to bounce this round
        //the paddle that scored a point start, at the beginning of the game it's always the AI
        if (this.AIStartsRound) {
            ball.position = new Vector2(0.25, 0.5);
            ball.angle = 90;
        } else {
            ball.position = new Vector2(0.75, 0.5);
            ball.angle = 270;
        }
    }

    //processes round outcome
    public RoundEnd(roundWinner_par: Paddle) {
        this.viewModel.entities.remove((this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "ball") as Ball));
        this.roundActive = false;
        roundWinner_par.points++;
        if (roundWinner_par.isAI) {
            this.viewModel.messageAdd("Opponent scored 1 point!", 1000);
            this.AIStartsRound = true;
        } else if (!roundWinner_par.isAI) {
            this.viewModel.messageAdd("You scored 1 point!", 1000);
            this.AIStartsRound = false;
        }
        this.viewModel.messageAdd("Next round starts in", 1000);
        this.viewModel.messageAdd("3", 500);
        this.viewModel.messageAdd("2", 500);
        this.viewModel.messageAdd("1", 500);
        this.viewModel.messageAdd("Go!", 500);
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
                img.src = src || "assets/pong/" + name + ".png";
            });
        }

        return Promise.all([
            PongGameViewModel.Create(app, this._gamemode).then((viewModel) => {
                var types = [];
                for (var i = 0; i < viewModel.entities.length; i++) {
                    var entityType = viewModel.entities[i].ClassType;
                    if (types.indexOf(entityType) == -1)
                        types.push(entityType);
                }

                var assets: Promise<any>[] = [];
                for (var i = 0; i < types.length; i++) {
                    var asset = "assets/pong/" + types[i] + ".png";
                    assets.push(loadAsset(types[i], asset));
                }

                return Promise.all(assets).then(() => { return viewModel; });
            }),
            this.app.ViewLoader.getView("pongGame"),
            loadAsset("ball"),
            loadAsset("ballBoosted"),
            loadAsset("invisibleBall"),
            loadAsset("paddlePlayer"),
            loadAsset("paddleAI")
        ]).then((results) => { 
            var viewModel = this.viewModel = results[0];
            var view = results[1];

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
                this.Start();
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
                this.Start();
                var w = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth,
                    s = w / 2160;

                var padding = 0.1 * w;

                var playAreaX = window.innerWidth * 0.9 - padding * 2,
                    playAreaY = w - padding * 2;

                var offsetX = (window.innerWidth - playAreaX) / 2,
                    offsetY = (window.innerHeight - playAreaY) / 2;

                this.inputs.cursor.x = (e.clientX - offsetX) / playAreaX;
                this.inputs.cursor.y = (e.clientY - offsetY) / playAreaY;
                this.inputs.last = "cursor";
            }).on("mousedown ", (e) => {
                this.Start();
                this.inputs.click = true;
                this.inputs.last = "cursor";
            }).on("mouseup ", (e) => {
                this.inputs.click = false;
                this.inputs.last = "cursor";
            });

            this.container.html(view);

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

            //pauses the game when the menu it active
            (this.viewModel.Actions[0] as GroupedTextItemViewModel).subscribe("changed", (caller, data) => {
                if ((this.viewModel.Actions[0] as GroupedTextItemViewModel).Grabbed) {
                    this.gameActive = false;
                }
            });

            this.canvas = $("#canvas_container canvas", this.container)[0] as HTMLCanvasElement;

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
            };
            $(window).add($(document)).add($("canvas")).on("resize", this.resizeWindow);

            var menu = this.viewModel.Actions[0];

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

            //duplicate subscribe event
            /*this.viewModel.subscribe("finished", (caller, data) => {
                this.viewModel.Actions.add(menu);
                for (var i = 0; i < this._inputControllers.length; i++)
                    this._inputControllers[i].reset([0, Math.round((this.viewModel.Actions[0]['children'].length - 1) / 2)]);

                var scoringType = 'score' in data ? "score" : "time";
                setTimeout(() => {
                    var gameEndContainer = $(".game-end." + (data.victory !== false ? "victory" : "loss") + "." + scoringType, this.container).addClass("show").removeClass("hide");
                    $("span." + scoringType, gameEndContainer).text(data[scoringType]);
                    $("menu.mainmenu > h1", this.container).addClass("hide").removeClass("show");
                }, 250);
            });*/

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

                //if a paddle has 11 points it wins
                if (this.gameActive && (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddlePlayer") as Paddle).points >= 11) {
                    this.gameActive = false;
                    this.viewModel.GameEnd(true);
                }
                if (this.gameActive && (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddleAI") as Paddle).points >= 11) {
                    this.gameActive = false;
                    this.viewModel.GameEnd(false);
                }

                //if game is active, no round active and no messages to display, start the round
                if (this.gameActive && !this.roundActive && this.viewModel.message == "") {
                    this.RoundStart();
                }

                //if the game is active, the player can move, even between rounds
                if (this.gameActive) {
                    this._MovePlayer();
                }
                //if game and round are active and no message to display, all entities move 
                if (this.gameActive && this.roundActive && this.viewModel.message == "") {
                    this._MoveAI();
                    this._MoveBall();
                    if (this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "invisibleBall")) {
                        this._MoveInvisibleBall();
                    }
                }

                //if a player is using a motion tracker, start the game with a delay of 5000 (now) to give enough time to render
                if (typeof (this.viewModel.Skeleton()) != "undefined") {
                    (async () => {
                        await new Promise(resolve => setTimeout(() => {
                            this.Start();
                        }, 5000));
                    })();
                }

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
        var windowDimensions = {
            width: context.canvas.width,
            height: context.canvas.height
        };
        //update active feedback
        for (var i = this._feedback.length - 1; i >= 0; i--) {
            var feedback = this._feedback[i];
            feedback.time -= time.elapsedTime;
            if (feedback.time < 0) {
                this._feedback.splice(i, 1);
            }
        }
        
        var w = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth,
            s = w / 2160;

        var padding = 0.1 * w;

        var playAreaX = window.innerWidth * 0.9 - padding * 2,
            playAreaY = w - padding * 2;

        var offsetX = (window.innerWidth - playAreaX) / 2 ,
            offsetY = (window.innerHeight - playAreaY) / 2 ;

        var gridXWidth = playAreaX / this.viewModel.gridWidth,
            gridYHeight = playAreaY / this.viewModel.gridHeight;

        for (var i = 0; i < this.viewModel.entities.length; i++) {
            var entity = this.viewModel.entities[i];
            var image = this._assets[entity.ClassType];
            if (entity.ClassType == "ball") {
                if ((entity as Ball).boost) {
                    var image = this._assets["ballboosted"];
                }
            }
            if (!image) {
                image = this._assets[entity.ClassType] = new Image();
                ((image) => {
                    image.onload = () => { delete image['isloading']; }
                })(image);
                image['isloading'] = true;
                image.src = "assets/pong/" + entity.ClassType + ".png";
            }
            else if ('isloading' in image == false) {
                var w = image.width * s,
                    h = image.height * s;

                var x = offsetX + entity.position.x * gridXWidth,
                    y = offsetY + entity.position.y * gridYHeight;

                context.drawImage(image, x - w / 2, y - h / 2, w, h);
            }
        }

        var x = offsetX + entity.position.x * gridXWidth,
            y = offsetY + entity.position.y * gridYHeight;

        var message = this.viewModel.message;

        //displays the current message
        context.fillStyle = "#000000";
        context.font = (48 * s) + "px arial";
        context.textAlign = "center";
        context.fillText(message, offsetX + gridXWidth / 2, offsetY + gridYHeight / 2);

        //displays a message until the game is active, any player input set the game as active
        if (!this.gameActive) {
            context.fillText("Press any button to start", offsetX + gridXWidth / 2, offsetY + gridYHeight / 2);
        }

        //displays points
        context.fillStyle = "#000000";
        context.font = (48 * s) + "px arial";
        context.fillText((this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddlePlayer") as Paddle).points.toString(), 1500 * s, 200 * s);
        context.fillText((this.viewModel.entities.find((pongEntity) => pongEntity.ClassType == "paddleAI") as Paddle).points.toString(),  1800 * s, 200 * s);
    }

}
