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

    //Shader
    import flash.display.Shader;
    import flash.filters.*;
    import flash.geom.Point;
    import flash.geom.Rectangle;

    //Asset Registry
    import registry.AssetsRegistry;

    public class Deaded extends FlxState {

        //scanlines overlay
        private var scanlines: FlxSprite;

        private var faintSprite: FlxSprite;
        private var faintSound: FlxSound;
        private var cameraSound: FlxSound;


        private var coolShader: Shader = new Shader(new AssetsRegistry.FilterCode());
        private var coolFilter: ShaderFilter = new ShaderFilter(coolShader);
        private var offsetRX: Number = 0.0;
        private var offsetRY: Number = 0.0;
        private var flash: Number = 1.1;
        private var red: Number = 2.0;
        private var flashTimer: Number = 1.2;
        private var flashed: Boolean = false;

        public function Deaded() {}

        override public function create(): void {

            faintSound = new FlxSound();
            faintSound.loadEmbedded(AssetsRegistry.DEADED, false);
            faintSound.volume = 0.2;
            faintSound.play();

            cameraSound = new FlxSound();
            cameraSound.loadEmbedded(AssetsRegistry.CRUSH_05, false);
            cameraSound.volume = 3;
            cameraSound.play();
            faintSprite = new FlxSprite(96, 56);
            add(faintSprite);
            faintSprite.loadGraphic(AssetsRegistry.DEADSCREEN, true, true, 128, 128);

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);

        }

        override public function postProcess(): void {
            coolShader.data.red.value = [red];
            coolShader.data.flash.value = [flash];
            FlxG.buffer.applyFilter(FlxG.buffer, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), coolFilter);
        }

        override public function update(): void {

            if (red > 1.0) {
                red -= 0.03;
            } else if (red <= 1.0 || FlxG.mouse.justReleased()) {
                red = 1.0
                flashed = true;
            }

            if (flashed == true) {
                flashTimer -= FlxG.elapsed;
                faintSprite.alpha = flashTimer;
            }

            if (faintSprite.alpha <= 0) {
                FlxG.state = new GameOver();
            }


        }
    }

}