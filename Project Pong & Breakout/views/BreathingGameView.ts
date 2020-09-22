class BreathingGameView extends BaseView {
    protected running: boolean;
    protected viewModel: BreathingGameViewModel;
    protected param: string;

    public constructor(app: App, param: string, name) {
        super(app, (name === undefined) ? "BreathingGame" : name);
        console.log("NAME: ",name)

        this.param = param;
    }

    protected _jellyfish: HTMLImageElement;
    protected _background: HTMLImageElement;

    protected _inputControllers: SmartArray<UserControls> = null;
    protected canvas: HTMLCanvasElement;

    protected backgroundURI = "assets/breathing/mountain-bg.jpg";
    protected audioURI = 'assets/audio/forest-ambiance.mp3';

    public init(): Promise<void> {

        var app = this.app as AppGame;

        // Set nav/history data

        var navData = {
            view: this.Name
        } as HistoryItem;
        if (typeof this.param !== "undefined") {
            navData.param = this.param;
        }
        this.app.History.addOrUpdate(navData);

        var musicVolume = 'setting:musicVolume' in localStorage ? Number(localStorage['setting:musicVolume']) : 0.5;
        var interfaceVolume = 'setting:musicVolume' in localStorage ? Number(localStorage['setting:interfaceVolume']) : 0.5;

        //prepares and binds audio to the view elements
        soundManager.createSound({
            id: 'button-hover',
            autoLoad: true,
            autoPlay: false,
            loops: 0,
            volume: 100 * interfaceVolume,
            url: 'assets/audio/button-hover.mp3'
        });
        soundManager.createSound({
            id: 'background-emotive-01',
            autoLoad: true,
            autoPlay: true,
            loops: 0,
            volume: 50 * musicVolume,
            url: 'assets/audio/impossible-worries.mp3'
        });
        soundManager.createSound({
            id: 'ambiance',
            autoLoad: true,
            autoPlay: false,
            loops: 2, //Forever
            volume: 50 * musicVolume,
            url: this.audioURI
        });

        return Promise.all([
            BreathingGameViewModel.Create(app, this.param),
            this.app.ViewLoader.getView("breathingGame"),
            new Promise((resolved) => {
                this._jellyfish = new Image();
                this._jellyfish.onload = () => resolved();
                this._jellyfish.src = "assets/breathing/jellyfish.png";
            }),
            new Promise((resolved) => {
                this._background = new Image();
                this._background.onload = () => resolved();
                this._background.src = this.backgroundURI;
            })
        ]).then((results) => {
            var viewModel = this.viewModel = results[0] as BreathingGameViewModel;
            var view = results[1] as string;

            this.container.html(view);

            this.app.BindManager.bind(viewModel, this.container);

            this._inputControllers = InputControllers.create(this.container, this.viewModel);

            soundManager.play("ambiance");

            var mainMenuItem = this.viewModel.Actions[0] as GroupedTextItemViewModel;
            mainMenuItem.subscribe("changed", (caller, data) => {
                if (data.property == "Selected" && caller instanceof ActionItemViewModel) {
                    this.viewModel.Paused = true;
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

            var mainMenuItem = this.viewModel.Actions[0] as GroupedTextItemViewModel;
            for (var i = 0; i < mainMenuItem.children.length; i++) {
                var action = mainMenuItem.children[i];
                action.subscribe("changed", (caller, data) => {
                    if (data.property == "Selected" && caller instanceof ActionItemViewModel) {
                        if (caller.Endpoint) {
                            $(document.createElement("a")).attr("href", caller.Endpoint)[0].click();
                        }
                        else if (caller.Name == "new" || caller.Name == "restart") {
                            this.navigate(this.Name + "View", this.param);
                        }
                        else if (caller.Name == "exit" || caller.Name == "quit") {
                            this.navigate(MenuView);
                        }
                        else if (caller.Name == "continue" || caller.Name == "game" || caller.Name == "return") {
                            if (this.viewModel.Completed != 0 && this.viewModel.ToComplete == 0) {
                                this.navigate(this.Name + "View", this.param);
                            } else {
                                this.viewModel.Paused = false;
                                for (var i = 0; i < this._inputControllers.length; i++) {
                                    this._inputControllers[i].reset([0]);
                                }
                            }
                        }
                    }
                });
            }

            this.container.on("click", ".slider .barrow", (e) => {
                var box = $(".barbox", e.currentTarget);
                var bbox = box[0].getBoundingClientRect();

                var x = e.pageX - bbox.left;
                var percentage = Math.min(1, Math.max(0, x / bbox.width));

                $("input[type=number]", box.closest("li")).val(Math.floor(percentage * 100) / 10).trigger('change');
            });

            this.viewModel.subscribe("finished", (caller, data) => {
                for (var i = 0; i < this._inputControllers.length; i++)
                    this._inputControllers[i].reset([0, Math.round((this.viewModel.Actions[0]['children'].length - 1) / 2)]);

                var scoringType = 'score' in data ? "score" : "time";
                setTimeout(() => {
                    var gameEndContainer = $(".game-end." + (data.victory !== false ? "victory" : "loss") + "." + scoringType, this.container).addClass("show").removeClass("hide");
                    $("span." + scoringType, gameEndContainer).text(data[scoringType]);
                    $("menu.mainmenu > h1", this.container).addClass("hide").removeClass("show");
                }, 250);
            });

            ////////////////////////////////////////////
            var lastTime: ITime = null;
            this.running = true;
            var run = (timestamp) => {
                var diff = lastTime ? timestamp - lastTime.time : 0;
                lastTime = {
                    elapsedTime: diff,
                    sessionTime: lastTime ? lastTime.sessionTime + diff : 0,
                    time: timestamp
                };

                this.render(lastTime);

                if (this.running) {
                    try {
                        requestAnimationFrame(run);
                    }
                    catch (e) {

                    }
                }
            };
            requestAnimationFrame(run);
        });
    }
    private resizeWindow;

    private render(time: ITime): void {
        if (this.running) {
            this.viewModel.update(time);

            var tiles = this.viewModel.Tiles;

            //Prepare render updates
            var canvas = ($("canvas")[0] as HTMLCanvasElement);
            var context = canvas.getContext("2d");

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            //Render
            context.save();
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            this.renderBefore(context, time);

            var toRender = new SmartArray(tiles);
            var sortCallback = (a, b) => ((a.Hovered ? 1 : 0) + (a.Selected ? 2 : 0)) - ((b.Hovered ? 1 : 0) + (b.Selected ? 2 : 0));
            toRender.sort(sortCallback);
            for (var i = 0; i < toRender.length; i++) {
                var tile = toRender[i];
                tile.update(time);
                tile.render(context, time, canvasWidth, canvasHeight);
            }

            this.renderAfter(context, time);
            context.restore();
        }
    }

    protected renderBefore(context: CanvasRenderingContext2D, time: ITime) {
        //Draw background-covering rectangle

        context.translate(context.canvas.width / 2, context.canvas.height / 2);

        context.drawImage(this._background, -this._background.width / 2, -this._background.height / 2, this._background.width, this._background.height);

        var percent = this.viewModel.TimeSinceGameStart / this.viewModel.TotalDurationOfGame;
        context.fillStyle = "black";
        context.globalAlpha = Math.max(0, 0.5 * (1 - percent));
        context.fillRect(-context.canvas.width / 2, -context.canvas.height / 2, context.canvas.width, context.canvas.height)
        context.globalAlpha = 1;
    }

    protected renderAfter(context: CanvasRenderingContext2D, time: ITime) {
        var scale = 1;
        if (window.innerWidth < 1600) {
            scale = 0.8;
            if (window.innerWidth < 1200) {
                scale = 0.6;
            }
        }

        var minCircleSize = 100 * scale;
        var growCircleSize = 200 * scale;

        context.font = 110 * scale + "px Roboto";
        context.fillStyle = "white";

        var timeInPhase = this.viewModel.TimeInCurrentPhase;
        var percentInPhase = this.viewModel.PercentageInCurrentPhase;
        var currentCircleSize;
        var circleText = Math.floor(((this.viewModel.DurationOfCurrentPhase - timeInPhase) / 1000) +1).toString();

        switch (this.viewModel.CurrentPhaseInRound) {
            case PhaseOfBreathingExerciseRound.In:
                currentCircleSize = minCircleSize + growCircleSize * this.easeBreatheBubble(percentInPhase);
                if (timeInPhase < 2000) {
                    circleText = this.app.TranslatorService.translate("breathe in.short");
                }
                break;
            case PhaseOfBreathingExerciseRound.Hold:
                currentCircleSize = minCircleSize + growCircleSize;
                if (timeInPhase < 2000) {
                    circleText = this.app.TranslatorService.translate("hold breath.short");
                }
                break;
            case PhaseOfBreathingExerciseRound.Out:
                currentCircleSize = minCircleSize + growCircleSize * (1 - this.easeBreatheBubble(percentInPhase));
                if (timeInPhase < 2000) {
                    circleText = this.app.TranslatorService.translate("breathe out.short");
                }
                break;
        }

        //Timer circle
        CanvasHelper.TimerArc(context, 0, 0, currentCircleSize, percentInPhase, 2, "white", 5, "white");

        context.textAlign = "center"; context.textBaseline = "middle";
        context.fillText(circleText, 0, 0);

        //Draw round circles
        var radius = 20 * scale;
        var offset = 10 * scale;
        var startx = -this.viewModel.NumberOfRounds * (radius + offset * 0.25);
        var starty = window.innerHeight / 2 - 50;
        for (var i = 0; i != this.viewModel.NumberOfRounds; i += 1) {
            context.lineWidth = 3; context.strokeStyle = "white"; context.fillStyle = "white"
            context.beginPath();
            context.arc(startx, starty, radius, 0, 2 * Math.PI);
            context.stroke();
            if (this.viewModel.CurrentRound > i) {
                context.fill();
            }
            startx += radius * 2 + offset;
        }

        //Draw rounded rect
        context.fillStyle = "black";
        context.globalAlpha = 0.5;

        var w = 100;
        var h = radius * 2;
        var x = startx;
        var y = starty - 20 * scale;
        CanvasHelper.RoundedRect(context, x, y, w, h, 5).fill();

        //Draw timer in rounded rect
        context.globalAlpha = 1;
        context.font = "30px Roboto"
        context.fillStyle = "white";

        var timer = Math.floor((this.viewModel.TotalDurationOfGame - this.viewModel.TimeSinceGameStart) / 1000);
        if (timer >= 0) {
            var txt = Math.floor(timer / 60).toString();
            var seconds = (timer % 60);
            if (seconds >= 10) {
                txt += ":" + (timer % 60).toString();
            }
            else {
                txt += ":0" + (timer % 60).toString();
            }
            context.fillText(txt, x + w / 2, y + h / 2);
        }

        //Debug
        /*context.fillText("RoundTime " + this.viewModel.RoundTime, -500, -400)
        context.fillText("BreateIn " + this.viewModel.BreathInTime, -500, -350)
        context.fillText("BreateHold"  + this.viewModel.BreathHoldTime, -500, -300)
        context.fillText("BreateOut " + this.viewModel.BreathOutTime, -500, -250)
        context.fillText("CurrentCircleSize " + Math.floor(currentCircleSize), -500, -200)
        context.fillText("PhasePercentage " + Math.floor(percentInPhase*100), -500, -150)*/
    }

    public remove() {
        for (var i = 0; i < this._inputControllers.length; i++)
            this._inputControllers[i].destroy();

        this.running = false;

        soundManager.stop("ambiance");
        soundManager.destroySound("ambiance");

        $(window).off("resize", this.resizeWindow);
        super.remove();
    }

    protected easeBreatheBubble(t: number) { return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;} //easeInOutSine
}
