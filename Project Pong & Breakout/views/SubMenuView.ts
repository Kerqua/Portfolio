class SubMenuView extends BaseView {
    private viewModel: SubMenuViewModel;
    private _game: string;

    public constructor(app: App, param: string) {
        super(app, "SubMenu");

        this._game = param;
    }

    protected _inputControllers: SmartArray<UserControls> = null;

    private _backgroundAudio: soundmanager.SMSound;
    public init(): Promise<void> {
        // Set nav/history data
        var navData = {
            view: this.Name
        } as HistoryItem;
        if (typeof this._game !== "undefined") {
            navData.param = this._game;
        }
        this.app.History.addOrUpdate(navData);

        var app = this.app as R4HealApp;

        var musicVolume = 'setting:musicVolume' in localStorage ? Number(localStorage['setting:musicVolume']) : 0.5;
        var interfaceVolume = 'setting:musicVolume' in localStorage ? Number(localStorage['setting:interfaceVolume']) : 0.5;

        //prepares and binds audio to the view elements
        var a = SoundManager.load('button-hover', 'assets/audio/button-hover.mp3', false);
        var b = SoundManager.load('button-grab', 'assets/audio/button-click.mp3', false);
        this._backgroundAudio = SoundManager.load('background-emotive-01', 'assets/audio/impossible-worries.mp3', true);

        a.volume = 100 * interfaceVolume;
        b.volume = 100 * interfaceVolume;
        this._backgroundAudio.volume = 50 * musicVolume;

        $('body').addClass("darktheme").addClass("menu");

        // Image pre loader, load menu images before showing the menu
        var loadedImages: { [key: string]: HTMLImageElement } = {};
        var imageLoader = (image: string) => {
            return new Promise((resolved, rejected) => {
                var img = new Image();
                img.onload = () => {
                    console.log("Loading success", image);
                    img.onload = null;
                    img.onerror = null;
                    resolved();
                };
                img.onerror = () => {
                    console.log("Loading failed", image);
                    img.onload = null;
                    img.onerror = null;
                    img = null;
                    rejected();
                };
                img.src = image;
                loadedImages[image] = img;
            });
        };

        return Promise.all([
            SubMenuViewModel.Create(app, this._game).then((viewModel) => {
                // After the viewmodel is loaded we que the action images to load before we show them
                var actions = viewModel.Actions.filter(p => p instanceof ImageActionItemViewModel) as ImageActionItemViewModel[];
                var tasks = [];
                for (var i = 0; i < actions.length; i++)
                    tasks.push(imageLoader(actions[i].Image));

                //Return the viewmodel on finish
                return Promise.all(tasks).then(() => {
                    return viewModel;
                });
            }),
            this.app.ViewLoader.getView("menu")
        ]).then((results) => {
            var viewModel = this.viewModel = results[0];
            var view = results[1];

            this.container.html(view);

            this.app.BindManager.bind(viewModel, this.container);

            //Prefered navigation:
            // - click item / scrollwheel
            // - use arrow up/down swap category, use left/right navigate category

            for (var i = 0; i < this.viewModel.Actions.length; i++) {
                var action = this.viewModel.Actions[i];
                action.subscribe("changed", (caller, data) => {
                    if (data.property == "Focus" && data.newValue && caller instanceof ActionItemViewModel) {
                        soundManager.play("button-hover");
                    }
                    else if (data.property == "Selected" && caller instanceof ActionItemViewModel) {
                        soundManager.play("button-grab");
                        if (caller.Endpoint) {
                            this.app.LoadBar.show("Loading");
                            if (caller.Endpoint[0] == "?") {
                                var parts = caller.Endpoint.substr(1).split('&');
                                var view = null;
                                var param = null;
                                for (var part in parts) {
                                    var subparts = parts[part].split("=");
                                    if (subparts[0] == "view") view = subparts[1];
                                    else if (subparts[0] == "param") param = subparts[1];
                                }
                                if (view !== null) {
                                    this.navigate(view + "View", param);
                                    return;
                                }
                            }
                            $(document.createElement("a")).attr("href", caller.Endpoint)[0].click();
                        }
                    }
                });
            }

            var registerAction = (action: ActionItemViewModel) => {
                action.subscribe("changed", (caller, data) => {
                    if (data.property == "Focus") {
                        //scroll to if not in the screen
                        var element = $("[data-id=\"" + action.Id + "\"]");
                        var parent = element.offsetParent();
                        if (parent.length == 0)
                            return;

                        element.stop();
                        parent.stop();
                        parent.clearQueue();

                        var scrollBox = new BoundingBox(
                            parent.width() / 2 + parent.offset().left,
                            parent.height() / 2 + parent.offset().top,
                            parent.width(),
                            parent.height()
                        );
                        //console.log("Scroll box: ", { x1: scrollBox.TopLeftX, y1: scrollBox.TopLeftY, x2: scrollBox.BottomRightX, y2: scrollBox.BottomRightY, w: scrollBox.Width, h: scrollBox.Height });

                        var elementBox = new BoundingBox(
                            element.width() / 2 + element.offset().left,
                            element.height() / 2 + element.offset().top,
                            element.width(),
                            element.height(),
                        );
                        //console.log("Element box: ", { x1: elementBox.TopLeftX, y1: elementBox.TopLeftY, x2: elementBox.BottomRightX, y2: elementBox.BottomRightY, w: elementBox.Width, h: elementBox.Height });

                        var fullyOnScreen = (
                            elementBox.TopLeftX > scrollBox.TopLeftX &&
                            elementBox.TopLeftY > scrollBox.TopLeftY &&
                            elementBox.BottomRightX < scrollBox.BottomRightX &&
                            elementBox.BottomRightY < scrollBox.BottomRightY
                        );
                        //console.log("fullyOnScreen: ", fullyOnScreen);
                        if (fullyOnScreen)
                            return;

                        //console.log("scroll: ", { x: scrollX, y: scrollY });

                        var currentScrollX = parent.scrollLeft();
                        var currentScrollY = parent.scrollTop();

                        if (scrollBox.TopLeftX > elementBox.TopLeftX) currentScrollX -= scrollBox.TopLeftX - elementBox.TopLeftX;
                        if (scrollBox.TopLeftY > elementBox.TopLeftY) currentScrollY -= scrollBox.TopLeftY - elementBox.TopLeftY;
                        if (scrollBox.BottomRightX < elementBox.BottomRightX) currentScrollX -= scrollBox.BottomRightX - elementBox.BottomRightX;
                        if (scrollBox.BottomRightY < elementBox.BottomRightY) currentScrollY -= scrollBox.BottomRightY - elementBox.BottomRightY;

                        //scroll?
                        parent.animate({ scrollLeft: currentScrollX, scrollTop: currentScrollY }, 200);
                    }
                });
                action.subscribe("selected", (caller, data) => {
                    console.log("activate");
                });
            };

            var registerActions = (actions: IReadonlyArray<ActionItemViewModel>) => {
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    if (action instanceof ActionItemGroupViewModel) {
                        registerActions(action.Children);
                    }
                    registerAction(action);
                }
            }
            registerActions(this.viewModel.Actions);

            this._inputControllers = InputControllers.create(this.container, this.viewModel);
        });
    }

    public remove() {
        for (var i = 0; i < this._inputControllers.length; i++)
            this._inputControllers[i].destroy();

        this._backgroundAudio.stop();

        this.viewModel.remove();

        $('body').removeClass("darktheme").removeClass("menu");
        super.remove();
    }
}
