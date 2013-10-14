package {
    /**
     * ...
     * @author Felipe Budinich
     */

    import org.flixel.*;
    import org.flixel.data.FlxAnim;
    import org.flixel.FlxG;
    import org.flixel.FlxGame;
    import org.flixel.FlxSprite;
    import org.flixel.FlxText;
    import util.Data;
    import org.flixel.data.FlxKeyboard;

    //Shader
    import flash.display.Shader;
    import flash.filters.*;
    import flash.geom.Point;
    import flash.geom.Rectangle;

    //Asset Registry
    import registry.AssetsRegistry;

    public class Winrar extends FlxState {

        private var winSprite: FlxSprite;
        private var pointString_01: String;
        private var pointHUD_01: FlxText;
        private var pointString_02: String;
        private var pointHUD_02: FlxText;

        //scanlines overlay
        private var scanlines: FlxSprite;

        public function Winrar() {}

        override public function create(): void {

            pointString_01 = "Current Score " + Data.currentScore.toString();
            pointString_02 = "Highest Score " + Data.highScore.toString();
            pointHUD_02 = new FlxText(0, 148, 320, pointString_02);
            pointHUD_01 = new FlxText(0, 58, 320, pointString_01);
            pointHUD_01.setFormat("Nokia", 16, 0xffffffff, "center");
            pointHUD_02.setFormat("Nokia", 16, 0xffffff55, "center");


            winSprite = new FlxSprite(40, 0, AssetsRegistry.WINSCREEN);
            this.add(winSprite);
            this.add(pointHUD_01);
            this.add(pointHUD_02);
            FlxG.play(AssetsRegistry.WINNAR);

            Data.save();

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);

        }

        override public function update(): void {


            if (FlxG.mouse.justReleased()) {
                FlxG.state = new Intro();
            }

            if (FlxG.keys.R && FlxG.keys.E) {
                trace('data erased');
                pointHUD_02.kill();
                Data.reset();
            } else if (FlxKeyboard.any() && FlxG.keys.R == false && FlxG.keys.E == false) {
                FlxG.state = new Intro();
            }


        }


    }

}