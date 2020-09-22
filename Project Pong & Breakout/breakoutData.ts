//this file contains classes required for Breakout
//some classes used in Breakout are also used in Pong

//base class inherited by other classes that are rendered in a canvas
abstract class BreakoutEntity extends PropertyNotification {
    public constructor(position_par: Vector2) {
        super();

        this.position = position_par;
    }

    protected _width: number;
    protected _height: number;
    public position: Vector2;
    private _hitbox: Hitbox;
    public get hitbox(){ return this._hitbox }

    public abstract get ClassType(): string;

    //(re)sets the hitbox based on position and size
    public SetHitbox() {
        this._hitbox = new Hitbox(new Vector2(this.position.x - (this._width / 2), this.position.y - (this._height / 2)), new Vector2(this.position.x + (this._width / 2), this.position.y + (this._height / 2)));
    }

    public CheckCollision(entity_par: BreakoutEntity): boolean {
        return this._hitbox.CheckCollision(entity_par.hitbox);
    }
}

class BreakoutBall extends BreakoutEntity {
    public constructor(position_par: Vector2, angle_par: number, speed_par: number, boostMultiplier_par: number) {
        super(position_par);

        this.position = position_par;
        this.angle = angle_par;
        this._speed = speed_par;
        this.boostMultiplier = boostMultiplier_par;

        this._width = 0.025;
        this._height = 0.025;
    }

    public get ClassType(): string {
        return "ball";
    };
    
    private _speed: number;
    public boostMultiplier: number;
    public angle: number;
    public boost: boolean;

    
    public get speed(){ return this._speed; }

    //inverts the vertical direction
    public BounceY() {
        this.boost = false;
        if (this.angle >= 0 && this.angle <= 180) {
            this.angle = 180 - this.angle;
        } else if (this.angle >= 90 && this.angle < 360) {
            this.angle = 540 - this.angle;
        }
    }

    public BounceX() {
        this.boost = false;
        //if (this.angle >= 0 && this.angle < 360) {
            this.angle = 360 - this.angle;
        //}
    }

    //sets new position, returns string that is set when the ball goes behind a paddle and calls BounceY() when entity is touching the top or bottom edge 
    public Move(destination_par: Vector2, bottomBorderActive_par: boolean) {
        if (destination_par.x > 0.9875) {
            destination_par.x = 0.9875;
            this.BounceX();
        }
        if (destination_par.x < 0.0125) {
            destination_par.x = 0.0125;
            this.BounceX();
        }
        if (destination_par.y > 0.9875 && bottomBorderActive_par) {
            destination_par.y = 0.9875;
            this.BounceY();
        }
        if (destination_par.y < 0.0125) {
            destination_par.y = 0.0125;
            this.BounceY();
        }

        this.position = destination_par;
    }
}

class BreakoutPaddle extends BreakoutEntity {
    public constructor(position_par: Vector2, speed_par: number) {
        super(position_par);

        this.speed = speed_par;
        this._widthMultiplier = 1;

        this._width = 0.08;
        this._height = 0.025;

        this._baseWidth = 0.08;
    }

    private _baseWidth: number 

    public get ClassType(): string {
        return "paddle";
    };

    public IncreaseWidth() {
        this._widthMultiplier++;
        this._width = this._baseWidth * this._widthMultiplier;
    }

    public DecreaseWidth() {
        this._widthMultiplier -= (this._widthMultiplier - 1) / 1000; 
        this._width = this._baseWidth * this._widthMultiplier;
    }
    
    public _widthMultiplier: number;
    public get widthMultiplier(): number { return this._widthMultiplier };
    public speed: number;

    public Move(destination_par: Vector2) {
        if (destination_par.x > 0.96) {
            destination_par.x = 0.96;
        }
        if (destination_par.x < 0.04) {
            destination_par.x = 0.04;
        }
        if (destination_par.y > 0.9875) {
            destination_par.y = 0.9875;
        }
        if (destination_par.y < 0.9125) {
            destination_par.y = 0.9125;
        }

        this.position = destination_par;
    }
}

class BreakoutBrick extends BreakoutEntity {
    public constructor(position_par: Vector2, health_par: number, points_par: number, color_par: BreakoutBrickColor, drop_par: BreakoutPowerupType) {
        super(position_par);

        this._health = health_par;
        this._points = points_par;
        this._color = color_par;
        this._drop = drop_par;

        this._width = 0.03;
        this._height = 0.03;
    }

    public get ClassType(): string {
        return "brick";
    };

    private _health: number;
    private _points: number;
    private _color: BreakoutBrickColor;
    private _drop: BreakoutPowerupType;
    private _dropChance: number;

    public get health() { return this._health}
    public get points() { return this._points }
    public get color() { return this._color }
    public get drop() { return this._drop }
    public get dropChance() { return this._dropChance }

    public Hit(): boolean {
        this._health--;

        if (this._health == 0) {
            return true;
        } else {
            return false;
        }
    }
}

class BreakoutPowerup extends BreakoutEntity {
    public constructor(position_par: Vector2, effect_par: BreakoutPowerupType) {
        super(position_par);

        this._effect = effect_par;

        this._width = 0.025;
        this._height = 0.025;
    }

    public get ClassType(): string {
        return "powerup";
    };

    private _effect: BreakoutPowerupType;

    public get effect(): BreakoutPowerupType {
        return this._effect;
    };
}

//contains all required entities and properties to run the game
class BreakoutField extends PropertyNotification {
    public constructor() {
        super();

        this.entities = new ObservableArray<BreakoutEntity>();
        this.messages = new ObservableArray<ScreenMessage>();
        this._points = 0;
    }

    public get ClassType(): string {
        return "field";
    };

    public entities: ObservableArray<BreakoutEntity>;
    public messages: ObservableArray<ScreenMessage>;

    private _points: number;
    public get points(): number { return this._points; }
    public AddPoints(points_par: number) {
        this._points += points_par;
        if (this._points < 0) {
            this._points = 0;
        }
    }

    public width: number;
    public height: number;
    //returns the first message in the array
    public CurrentMessageGet(): string {
        if (typeof this.messages[0] !== "undefined") {
            if (this.messages[0].IsExpired()) {
                this.messages.shift();
                if (this.messages.count() !== 0) {
                    this.messages[0].SetExpireTimer();
                }
            }
            if (this.messages.count() !== 0) {
                return this.messages[0].text;
            } else {
                return "";
            }
        } else {
            return "";
        }
    }
}

//Level editor

//some number values have a getter that converts it to a string and back to a number
//this is done because a data-bind value is a string a javascript, so it needs to be converted to a number which typescript can only do with a string


class BreakoutBrickTemplate extends DataPropertyNotification {
    public constructor(id_par: number, color_par: BreakoutBrickColor, health_par: number, points_par: number) {
        super();

        this.id = id_par;
        this.color = color_par;
        this.health = health_par;
        this.points = points_par;
        this.positions = new ObservableArray<ObservableArray<number>>();
        
    }

    public id: number;
    public color: BreakoutBrickColor;
    public health: number;
    public points: number;
    public positions: ObservableArray<ObservableArray<number>>;
    public asset: HTMLImageElement;
    public get assetsrc() { return this.asset.src }

    public selected: boolean;
}

class BreakoutLevel extends DataPropertyNotification {
    public constructor(name_par: string, border_par: { top: number, right: number, bottom: number, left: number }, width_par: number, height_par: number, bricks_par: ObservableArray<BreakoutBrickTemplate>) {
        super();

        this.name = name_par;
        this.border = new BreakoutLevelBorder(border_par.top, border_par.right, border_par.bottom, border_par.left);
        this.width = width_par;
        this.height = height_par;
        this.bricks = new ObservableArray<BreakoutBrickTemplate>(bricks_par);
        this.RefreshSelectedBrickBind();
    }

    public name: string;
    public border: BreakoutLevelBorder;
    public width: number;
    public height: number;
    public bricks: ObservableArray<BreakoutBrickTemplate>;

    public get Width() { return parseInt(this.width.toString()); }
    public get Height() { return parseInt(this.height.toString()); }

    public selectedBrick: number;
    public get getSelectedBrick() {
        return this.bricks.find((brickTemplate) => brickTemplate.selected);
    }

    public RefreshSelectedBrickBind() {
        this.changed("getSelectedBrick", this.getSelectedBrick);
    }
}

class BreakoutLevelBorder extends DataPropertyNotification {
    public constructor(top_par: number, right_par: number, bottom_par: number, left_par: number) {
        super();

        this.top = top_par;
        this.right = right_par;
        this.bottom = bottom_par;
        this.left = left_par;
    }

    public top: number;
    public right: number;
    public bottom: number;
    public left: number;

    public get Top() { return parseInt(this.top.toString());}
    public get Right() { return parseInt(this.right.toString());}
    public get Bottom() { return parseInt(this.bottom.toString());}
    public get Left() { return parseInt(this.left.toString());}
}

//Brick colors, limited to the available assests
enum BreakoutBrickColor {
    black,
    blue,
    green,
    grey,
    orange,
    pink,
    red,
    yellow
}

enum BreakoutPowerupType {
    none,
    bonusPoints,
    increasePaddleWidth,
    spawnBall,
    spawnBottomBarrier
}