package scenes{
    /**
     * ...
     * @author Felipe Budinich
     */

    import org.flixel.*;
    import org.flixel.data.FlxAnim;
    import org.flixel.FlxG;
    import org.flixel.FlxGame;
    import org.flixel.FlxSprite;
    import org.flixel.data.FlxKeyboard;
    import util.Data;
	
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.net.navigateToURL;
	import flash.net.URLRequest;

    //Asset Registry
    import registry.AssetsRegistry;

    public class Intro extends FlxState {

        //scanlines overlay
        private var scanlines: FlxSprite;

        private var introSprite: FlxSprite;
        private var introSnd: FlxSound;
		private var btnCharity:Sprite = new Sprite();
		private var btnPlay:Sprite = new Sprite();

        public function Intro() {}

        override public function create(): void {
            introSprite = new FlxSprite(40, 0, AssetsRegistry.INTRO);
            this.add(introSprite);
            introSnd = new FlxSound();
            introSnd.loadEmbedded(AssetsRegistry.INTROSND);
            FlxG.mouse.show();
			
			//buttons
			
			// the we draw a green rectangle inside of it
			btnCharity.graphics.beginFill(0xff1115, 0);
			btnCharity.graphics.drawRect(0, 0, 128, 34);
			btnCharity.graphics.endFill();
			btnCharity.blendMode = "darken";
			
			btnPlay.graphics.beginFill(0xF0FF0F, 0);
			btnPlay.graphics.drawRect(0, 0, 85, 34);
			btnPlay.graphics.endFill();
			btnPlay.blendMode = "add";
			// then we add the button to stage
			btnCharity.x = 142;
			btnCharity.y = 175;
			
			btnPlay.x = 55;
			btnPlay.y = 175;
			
			btnCharity.buttonMode  = true;
			btnCharity.mouseChildren = false;
			
			btnPlay.buttonMode  = true;
			btnPlay.mouseChildren = false;
			
			this.addChild(btnCharity);
			this.addChild(btnPlay);
			
			// first we add the event to our button
			btnCharity.addEventListener(MouseEvent.CLICK, btnCharityClick, false, 0, true);
			//btnCharity.addEventListener(MouseEvent.ROLL_OVER, btnCharityOver, false, 0, true);
			//btnCharity.addEventListener(MouseEvent.ROLL_OUT, btnCharityOut, false, 0, true);
			
			btnPlay.addEventListener(MouseEvent.CLICK, btnPlayClick, false, 0, true);
			//btnPlay.addEventListener(MouseEvent.ROLL_OVER, btnPlayOver, false, 0, true);
			//btnPlay.addEventListener(MouseEvent.ROLL_OUT, btnPlayOut, false, 0, true);

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
			scanlines.blend = "add";
            add(scanlines);

        }

        override public
        function update(): void {


            if (FlxG.keys.R && FlxG.keys.E) {

                Data.reset();
            } else if (FlxKeyboard.any() && FlxG.keys.R == false && FlxG.keys.E == false) {
                FlxG.state = new Game();
            }


        }
		
		private function btnCharityClick(e:MouseEvent):void {
		   
		   navigateToURL(new URLRequest("http://goo.gl/xApFuW"), "_blank");
		}
		private function btnCharityOver(e:MouseEvent):void {
			btnCharity.alpha = 1;
		}
		private function btnCharityOut(e:MouseEvent):void {
			btnCharity.alpha = 0;
		}
		private function btnPlayClick(e:MouseEvent):void {
			introSnd.play();
            FlxG.state = new Game();
		}
		private function  btnPlayOver(e:MouseEvent):void {
			btnPlay.alpha = 1;
		}
		private function btnPlayOut(e:MouseEvent):void {
			btnPlay.alpha = 0;
		}

    }

}