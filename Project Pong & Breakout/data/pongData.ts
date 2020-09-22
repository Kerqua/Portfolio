//base class inherited by other classes that are rendered in a canvas
abstract class PongEntity extends PropertyNotification {
    public constructor() {
        super();
    }

    public abstract position: Vector2;
    public hitbox: Hitbox;

    //size of the entity on a scale of 0 to 1 with 1 being the entire width/height of the screen
    _size = {
        width: 0,
        height: 0
    }
    public abstract get ClassType(): string;

    //(re)sets the hitbox based on position and size
    public SetHitbox() {
        this.hitbox = new Hitbox(new Vector2(this.position.x - (this._size.width / 2), this.position.y - (this._size.height / 2)), new Vector2(this.position.x + (this._size.width / 2), this.position.y + (this._size.height / 2)));
    }
}

class Ball extends PongEntity {
    public constructor(position_par: Vector2, angle_par: number, speed_par: number, boostMultiplier_par: number) {
        super();

        this.position = position_par;
        this.angle = angle_par;
        this.speed = speed_par;
        this.boostMultiplier = boostMultiplier_par;
    }
    
    public get ClassType(): string {
        return "ball";
    };

    _size  = {
        width: 0.05,
        height: 0.05
    }

    public position: Vector2;
    public angle: number;
    public speed: number; //
    public boostMultiplier: number;
    public boost: boolean;

    //returns speed multiplied by the booster if active. Never use the property to get the speed
    public Speed(): number {
        if (this.boost) {
            return this.speed * this.boostMultiplier;
        } else {
            return this.speed;
        }
    }

    //inverts the vertical direction
    public BounceY() {
        this.boost = false;
        if (this.angle >= 0 && this.angle < 180) {
            this.angle = 180 - this.angle;
        } else if (this.angle >= 90 && this.angle < 360) {
            this.angle = 540 - this.angle;
        }
    }

    //sets new position, returns string that is set when the ball goes behind a paddle and calls BounceY() when entity is touching the top or bottom edge 
    public Move(destination_par: Vector2): string {
        var result = "";
        if (destination_par.x > 1) {
            destination_par.x = 1;
            result = "paddlePlayerScored";
        }
        if (destination_par.x < 0) {
            destination_par.x = 0;
            result = "paddleAIScored";
        }
        if (destination_par.y > 1) {
            destination_par.y = 1;
            this.BounceY();
        }
        if (destination_par.y < 0) {
            destination_par.y = 0;
            this.BounceY();
        }
        
        this.position = destination_par;

        return result;
    }
}

//invisible ball is faster than the visible ball to help the AI predict where it will hit
class InvisibleBall extends PongEntity {
    public constructor(ball_par: Ball) {
        super();

        this.position = ball_par.position;
        this.angle = ball_par.angle;
        this.speed = ball_par.speed * 2;
        this.boost = ball_par.boost;
        this.boostMultiplier = ball_par.boostMultiplier;
    }

    public get ClassType(): string {
        return "invisibleBall";
    };

    _size = {
        width: 0.05,
        height: 0.05
    }

    public position: Vector2;
    public angle: number;
    public speed: number;
    public boostMultiplier: number;
    public boost: boolean;

    public Speed(): number {
        if (this.boost) {
            return this.speed * this.boostMultiplier;
        } else {
            return this.speed;
        }
    }

    public BounceY() {
        this.boost = false;
        if (this.angle >= 0 && this.angle < 180) {
            this.angle = 180 - this.angle;
        } else if (this.angle >= 90 && this.angle < 360) {
            this.angle = 540 - this.angle;
        }
    }

    public Move(destination_par: Vector2){
        if (destination_par.x > 0.95) {
            destination_par.x = 0.95;
            this.speed = 0;
        }
        if (destination_par.x < 0.95) {
            if (destination_par.x < 0) {
                destination_par.x = 0;
            }
            if (destination_par.y > 1) {
                destination_par.y = 1;
                this.BounceY();
            }
            if (destination_par.y < 0) {
                destination_par.y = 0;
                this.BounceY();
            }
        }
        this.position = destination_par;

        return;
    }
}

abstract class Paddle extends PongEntity {
    public constructor(id_par: number, isAI_par: boolean, width_par: number, position_par: Vector2, maxSpeed_par: number) {
        super();

        this._id = id_par;
        this._isAI = isAI_par;
        this.width = width_par;
        this.position = position_par;
        this.maxSpeed = maxSpeed_par;
        this.points = 0;
    }

    public get ClassType(): string {
        return "paddle";
    };

    public get isAI(): boolean {
        return this._isAI;
    };

    _size = {
        width: 0.05,
        height: 0.30
    }

    private _id: number;
    private _isAI: boolean;
    public width: number;
    public position: Vector2;
    public points: number;
    public maxSpeed: number;

    abstract area: Hitbox; 

    //moves paddle towards destination, if destination is outside of area, sets destination back within the area
    public Move(destination_par: Vector2) {
        if (destination_par.x > this.area.corner2().x) {
            destination_par.x = this.area.corner2().x;
        }
        if (destination_par.x < this.area.corner1().x) {
            destination_par.x = this.area.corner1().x;
        }
        if (destination_par.y > this.area.corner2().y) {
            destination_par.y = this.area.corner2().y;
        }
        if (destination_par.y < this.area.corner1().y) {
            destination_par.y = this.area.corner1().y;
        }
        this.position = destination_par;
    }
}

class PaddlePlayer extends Paddle {
    public constructor(id_par: number, width_par: number, position_par: Vector2, maxSpeed_par: number) {
        super(id_par, false, width_par, position_par, maxSpeed_par);
    }

    public get ClassType(): string {
        return "paddlePlayer";
    };

    area = new Hitbox(new Vector2(0, 0), new Vector2(0.1,1));
}

class PaddleAI extends Paddle {
    public constructor(id_par: number, width_par: number, position_par: Vector2, maxSpeed_par: number) {
        super(id_par, true, width_par, position_par, maxSpeed_par);
    }

    public get ClassType(): string {
        return "paddleAI";
    };

    area = new Hitbox(new Vector2(0.9, 0), new Vector2(1, 1));
}

//contains all required entities and properties to run the game
class Field extends PropertyNotification {
    public constructor() {
        super();

        this.entities = new ObservableArray<PongEntity>();
        this.messages = new ObservableArray<ScreenMessage>();
    }

    public get ClassType(): string {
        return "field";
    };

    public startTime: ITime;
    public position: Vector2;

    public entities: ObservableArray<PongEntity>;
    public messages: ObservableArray<ScreenMessage>;

    //returns the first message in the array
    //also deletes expired messages and and starts the timer of the next one
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

class Hitbox extends PropertyNotification {
    public constructor(corner1_par: Vector2, corner2_par: Vector2) {
        super();

        this._corner1 = corner1_par;
        this._corner2 = corner2_par;
    }

    private _corner1: Vector2;
    private _corner2: Vector2;

    public corner1(): Vector2 { return this._corner1; }
    public corner2(): Vector2 { return this._corner2; }

    //checks if this hitbox collides with another hitbox
    //contains a very large if statement which checks if the corner of an object is inside another object (collides) - works both ways
    //might cause errors if an entire hitbox is inside another hitbox 
    public CheckCollision(hitbox_par: Hitbox): boolean {
        if ((((hitbox_par._corner1.x > this._corner1.x && hitbox_par._corner1.x < this._corner2.x) ||
            (hitbox_par._corner2.x > this._corner1.x && hitbox_par._corner2.x < this._corner2.x)) &&
            ((hitbox_par._corner1.y > this._corner1.y && hitbox_par._corner1.y < this._corner2.y) ||
            (hitbox_par._corner2.y > this._corner1.y && hitbox_par._corner2.y < this._corner2.y))) ||

            ((this._corner1.x > hitbox_par._corner1.x && this._corner1.x < hitbox_par._corner2.x) ||
            (this._corner2.x > hitbox_par._corner1.x && this._corner2.x < hitbox_par._corner2.x)) &&
            ((this._corner1.y > hitbox_par._corner1.y && this._corner1.y < hitbox_par._corner2.y) ||
            (this._corner2.y > hitbox_par._corner1.y && this._corner2.y < hitbox_par._corner2.y))) {
            return true;
        } else {
            return false;
        }
    }
}

//used for displaying text for a set amount of time 
//time will not count down if SetExpireTimer() is not called (with one exception - see constructor)
//a different method is likely more effectient but due to no quick alternative this method is used
class ScreenMessage extends PropertyNotification {
    public constructor(text_par: string, duration_par: number, position_par?: Vector2) {
        super();

        this.text = text_par;
        this._duration = duration_par;
        this._expireTime = new Date(Date.now() + 1000000);
        //optimization - this value for this._expireTime causes a ScreenMessage to expire after 1000 seconds if SetExpireTimer() has not been called
        //Unlikely to cause problems and if so the value can easily be increased, however a better approach should be found

        this._position = position_par;
    }

    public text: string;
    private _duration: number;

    private _expireTime: Date;

    private _position: Vector2;
    public get position() { return this._position; }

    public IsExpired(): boolean {
        if (this._expireTime.getTime() < Date.now()) {
            return true;
        } else {
            return false;
        }
    }

    public SetExpireTimer() {
        this._expireTime = new Date(Date.now() + this._duration);
    }
}