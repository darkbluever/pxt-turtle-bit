//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Motor', 'RGB-led', 'Neo-pixel', 'Sensor', 'Tone']"
namespace turtlebit {
    /**
     * use for control PCA9685
     */
    const PCA9685_ADDRESS = 0x47;   //device address
    const MODE1 = 0x00;
    //const MODE2 = 0x01;
    //const SUBADR1 = 0x02;
    //const SUBADR2 = 0x03;
    //const SUBADR3 = 0x04;
    const PRESCALE = 0xFE;
    const LED0_ON_L = 0x06;
    const LED0_ON_H = 0x07;
    const LED0_OFF_L = 0x08;
    //const LED0_OFF_H = 0x09;
    //const ALL_LED_ON_L = 0xFA;
    //const ALL_LED_ON_H = 0xFB;
    //const ALL_LED_OFF_L = 0xFC;
    //const ALL_LED_OFF_H = 0xFD;

    let PCA9685_Initialized = false

    /**
     * use for RGB-LED
     */
    export enum COLOR {
        //% block="red"
        red,
        //% block="green"
        green,
        //% block="blue"
        blue,
        //% block="white"
        white,
        //% block="black"
        black
    }
    /**
     * use for control motor
     */
    export enum DIR {
        //% block="run_forward"
        Run_forward = 0,
        //% block="run_back"
        Run_back = 1,
        //% block="turn_left"
        Turn_Left = 2,
        //% block="turn_right"
        Turn_Right = 3/*,
        //% block="left"
        Run_Left = 4,
        //% block="right"
        Run_Right = 5
        */
    }
    export enum LR {
        //% block="left_side"
        LeftSide = 0,
        //% block="right_side"
        RightSide = 1
    }
    export enum MotorState {
        //% block="stop"
        stop = 0,
        //% block="brake"
        brake = 1
    }
    export enum MD {
        //% block="forward"
        Forward = 0,
        //% block="back"
        Back = 1
    }

    export enum LT {
        //% block="left"
        Left,
        //% block="center"
        Center,
        //% block="right"
        Right
    }

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function i2cWrite(PCA9685_ADDRESS: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    function init_PCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00);  //initialize the mode register 1
        setFreq(50);   //20ms
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        PCA9685_Initialized = true;
    }

    /////////////////////////////////////////////////////
    /**
     * car run diretion
     */
    //% block="car $direction speed: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function run(direction: DIR, speed: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        let speed_value = Math.map(speed, 0, 100, 0, 4095);
        switch (direction) {
            case 0:  //run forward
                setPwm(0, 0, speed_value);  //control speed : 0---4095
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                setPwm(5, 0, speed_value);  //control speed : 0---4095
                setPwm(4, 0, 0);
                setPwm(3, 0, 4095);
                break;
            case 1:  //run back
                setPwm(0, 0, speed_value);  //control speed : 0---4095
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                setPwm(5, 0, speed_value);  //control speed : 0---4095
                setPwm(4, 0, 4095);
                setPwm(3, 0, 0);
                break;
            case 2:  //turn left
                setPwm(0, 0, speed_value);  //control speed : 0---4095
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                setPwm(5, 0, speed_value);  //control speed : 0---4095
                setPwm(4, 0, 0);
                setPwm(3, 0, 4095);
                break;
            case 3:  //turn right
                setPwm(0, 0, speed_value);  //control speed : 0---4095
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                setPwm(5, 0, speed_value);  //control speed : 0---4095
                setPwm(4, 0, 4095);
                setPwm(3, 0, 0);
                break;
            /*
            case 4:  //run left
                setPwm(0, 0, 4095);  //control speed : 0---4095
                setPwm(1, 0, 0);
                setPwm(2, 0, 0);
                setPwm(5, 0, speed_value);  //control speed : 0---4095
                setPwm(4, 0, 0);
                setPwm(3, 0, 4095);
                break;
            case 5:  //run right
                setPwm(0, 0, speed_value);  //control speed : 0---4095
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                setPwm(5, 0, 4095);  //control speed : 0---4095
                setPwm(4, 0, 0);
                setPwm(3, 0, 0);
                break;
            */
            default: break;
        }
    }
    /**
     * set cat state
     */
    //% block="car $sta"
    //% group="Motor" weight=98
    export function car_state(sta: MotorState) {
        //if (!PCA9685_Initialized) {
        //init_PCA9685();
        //}

        if (sta == 0) {           //stop
            setPwm(0, 0, 4095);  //control speed : 0---4095
            setPwm(1, 0, 0);
            setPwm(2, 0, 0);
            setPwm(5, 0, 4095);  //control speed : 0---4095
            setPwm(4, 0, 0);
            setPwm(3, 0, 0);
        }

        if (sta == 1) {           //brake
            setPwm(0, 0, 0);  //control speed : 0---4095
            //setPwm(1, 0, 4095);
            //setPwm(2, 0, 4095);
            setPwm(5, 0, 0);  //control speed : 0---4095
            //setPwm(4, 0, 4095);
            //setPwm(3, 0, 4095);
        }
    }
    
    /**
     * set speed of motor
     */
    //% block="$M motor run $D speed: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function Motor(M: LR, D: MD, speed: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        let speed_value = Math.map(speed, 0, 100, 0, 4095);
        if (M == 0 && D == 0) {
            setPwm(0, 0, speed_value);  //control speed : 0---4095
            setPwm(1, 0, 0);
            setPwm(2, 0, 4095);
        }
        if (M == 0 && D == 1) {
            setPwm(0, 0, speed_value);  //control speed : 0---4095
            setPwm(1, 0, 4095);
            setPwm(2, 0, 0);
        }

        if (M == 1 && D == 0) {
            setPwm(5, 0, speed_value);  //control speed : 0---4095
            setPwm(4, 0, 0);
            setPwm(3, 0, 4095);
        }
        if (M == 1 && D == 1) {
            setPwm(5, 0, speed_value);  //control speed : 0---4095
            setPwm(4, 0, 4095);
            setPwm(3, 0, 0);
        }

    }
    /**
     * set motor state
     */
    //% block="$M motor $act"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=96
    export function MotorSta(M: LR, act: MotorState) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        if (M == 0 && act == 0) {           //stop
            setPwm(0, 0, 4095);  //control speed : 0---4095
            setPwm(1, 0, 0);
            setPwm(2, 0, 0);
        }
        if (M == 0 && act == 1) {           //brake
            setPwm(0, 0, 0);  //control speed : 0---4095
            //setPwm(1, 0, 4095);
            //setPwm(2, 0, 4095);
        }

        if (M == 1 && act == 0) {           //stop
            setPwm(5, 0, 4095);  //control speed : 0---4095
            setPwm(4, 0, 0);
            setPwm(3, 0, 0);
        }
        if (M == 1 && act == 1) {           //brake
            setPwm(5, 0, 0);  //control speed : 0---4095
            //setPwm(4, 0, 4095);
            //setPwm(3, 0, 4095);
        }
    }

    /////////////////////////////////////////////////////
    /**
     * set rgb-led brightness
     */
    let L_brightness = 4095;  //control the rgb-led brightness
    //% block="LED brightness $br"
    //% br.min=0 br.max=255
    //% group="RGB-led" weight=79
    export function LED_brightness(br: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        L_brightness = Math.map(br, 0, 255, 0, 4095);
    }

    /**
     * set the rgb-led color via the color card
     */
    //% block="set $RgbLed RGBled $col"
    //% group="RGB-led" weight=78
    export function Led(RgbLed: LR, col: COLOR) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        if (RgbLed == 0) {    //left side RGB_LED
            setPwm(9, 0, 0);
            setPwm(10, 0, 0);
            setPwm(11, 0, 0);
            if (col == COLOR.red) {
                setPwm(9, 0, L_brightness);
            }
            if (col == COLOR.green) {
                setPwm(10, 0, L_brightness);
            }
            if (col == COLOR.blue) {
                setPwm(11, 0, L_brightness);
            }
            if (col == COLOR.white) {
                setPwm(9, 0, L_brightness);
                setPwm(10, 0, L_brightness);
                setPwm(11, 0, L_brightness);
            }
            if (col == COLOR.black) {
            }
        }

        if (RgbLed == 1) {    //right side RGB_LED
            setPwm(6, 0, 0);
            setPwm(7, 0, 0);
            setPwm(8, 0, 0);
            if (col == COLOR.red) {
                setPwm(7, 0, L_brightness);
            }
            if (col == COLOR.green) {
                setPwm(6, 0, L_brightness);
            }
            if (col == COLOR.blue) {
                setPwm(8, 0, L_brightness);
            }
            if (col == COLOR.white) {
                setPwm(6, 0, L_brightness);
                setPwm(7, 0, L_brightness);
                setPwm(8, 0, L_brightness);
            }
            if (col == COLOR.black) {
            }
        }
    }
    /**
     * set the rgb-led color via data
     */
    //% block=" set RGBled $RgbLed R:$red G:$green B:$blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% group="RGB-led" weight=77
    export function SetLed(RgbLed: LR, red: number, green: number, blue: number) {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }

        let R = Math.map(red, 0, 255, 0, L_brightness);
        let G = Math.map(green, 0, 255, 0, L_brightness);
        let B = Math.map(blue, 0, 255, 0, L_brightness);

        if (RgbLed == 0) {    //left side RGB_LED
            setPwm(9, 0, R);
            setPwm(10, 0, G);
            setPwm(11, 0, B);
        }
        if (RgbLed == 1) {    //right side RGB_LED
            setPwm(6, 0, G);
            setPwm(7, 0, R);
            setPwm(8, 0, B);
        }
    }
    /**
     * turn off all rgb-led
     */
    //% block="turn off all RGB-led"
    //% group="RGB-led" weight=76
    export function OFFLed() {
        if (!PCA9685_Initialized) {
            init_PCA9685();
        }
        let led_pin;
        for (led_pin = 6; led_pin <= 11; led_pin++) {
            setPwm(led_pin, 0, 0);
        }
    }

    /////////////////////////////////////////////////////
    //% block="LineTracking"
    //% group="Sensor" weight=69
    export function LineTracking(): number {
        let val = 0;
        val = (pins.digitalReadPin(DigitalPin.P14) << 2) +
              (pins.digitalReadPin(DigitalPin.P15) << 1) +
              (pins.digitalReadPin(DigitalPin.P16));
        return val;
    }


    /**
     * line tracking
     * @return 0:保持原状
     *         1:原地右转，直角弯
     *         2:原地左转，直角弯
     *         3:原地左转
     *         4:原地右转
     *         5:小弯左转
     *         6:小弯右转
     *         7:直行
     */
    /*
    /////////////////////////////////////////////////////
    //% block="LineTracking4C"
    //% group="Sensor" weight=69
    export function LineTracking4C(): number {
        // TrackSensorLeftPin1 LeftPin2 RightPin1 RightPin2
        //       P14              P11       P15       P16
        //       l1               l2        r1        r2
        let l1 = 1;
        let l2 = 1;
        let r1 = 1;
        let r2 = 1;
        l1 = pins.digitalReadPin(DigitalPin.P14)
        l2 = pins.digitalReadPin(DigitalPin.P11)
        r1 = pins.digitalReadPin(DigitalPin.P15)
        r2 = pins.digitalReadPin(DigitalPin.P16)
        //四路循迹引脚电平状态
        // 0 0 X 0
        // 1 0 X 0
        // 0 1 X 0
        //以上6种电平状态时小车原地右转，速度为250,延时80ms
        //处理右锐角和右直角的转动
        if ((l1 == 0 || l2 == 0) && r2 == 0) {
            return 1;
        }
        //四路循迹引脚电平状态
        // 0 X 0 0       
        // 0 X 0 1 
        // 0 X 1 0       
        //处理左锐角和左直角的转动
        else if (l1 == 0 && (r1 == 0 || r2 == 0)) {
            return 2;
        }
        // 0 X X X
        //最左边检测到
        else if (l1 == 0)
        {
            return 3;
        }
        // X X X 0
        //最右边检测到
        else if (r2 == 0 )
        {
            return 4;
        }
        //四路循迹引脚电平状态
        // X 0 1 X
        //处理左小弯
        else if (l2 == 0 && r1 == 1)
        {
            return 5;
        }
        //四路循迹引脚电平状态
        // X 1 0 X  
        //处理右小弯
        else if (l2 == 1 && r1 == 0)
        {
            return 6;
        }
        //四路循迹引脚电平状态
        // X 0 0 X
        //处理直线
        else if (l2 == 0 && r1 == 0)
        {
            return 7;
        }
        //当为1 1 1 1时小车保持上一个小车运行状态
        return 0;
    }
    */

    /**
     * Ultrasonic sensor
     */
    let lastTime = 0;
    //% block="Ultrasonic"
    //% group="Sensor" weight=68
    export function ultra(): number {
        //send trig pulse
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P1, 0)
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P1, 1)
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P1, 0)

        // read echo pulse  max distance : 6m(35000us)  
        let t = pins.pulseIn(DigitalPin.P2, PulseValue.High, 35000);
        let ret = t;

        //Eliminate the occasional bad data
        if (ret == 0 && lastTime != 0) {
            ret = lastTime;
        }
        lastTime = t;

        return Math.round(ret / 58);
    }
    /**
     * A button on the driver board
     */
    //% block="Button"
    //% group="Sensor" weight=66
    export function button(): number {
        return pins.digitalReadPin(DigitalPin.P5);
    }
}
