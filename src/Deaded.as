package  
{
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
	 
	public class Deaded extends FlxState
	{
		//Screen Noise
		[Embed(source = '../assets/shader/blend.pbj', mimeType = "application/octet-stream")] protected var noiseShaderData:Class;
		private var noiseShader:Shader = new Shader(new noiseShaderData());
		private var noiseFilter:ShaderFilter = new ShaderFilter(noiseShader);
		[Embed(source = '../assets/gfx/noise_01.png')] private static const NOISE_01:Class;
		private var blendvar:Number = 1.0;
		
		[Embed(source='../assets/gfx/dead.png')] private static const DEADSCREEN:Class;
		[Embed(source = '../assets/snd/deaded.mp3')] protected var DEADED:Class;
		[Embed(source = '../assets/snd/car/car_05.mp3')] protected var CRUSH_05:Class;
		[Embed(source='../assets/shader/flash.pbj', mimeType='application/octet-stream')] private var FilterCode:Class;
		
		private var faintSprite:FlxSprite;
		private var faintSound:FlxSound;
		private var cameraSound:FlxSound;

		
		private var coolShader:Shader = new Shader(new FilterCode());
		private var coolFilter:ShaderFilter = new ShaderFilter(coolShader);
		private var offsetRX:Number = 0.0;
		private var offsetRY:Number = 0.0;
		private var flash:Number = 1.1;
		private var red:Number = 2.0;
		private var flashTimer:Number = 1.2;
		private var flashed:Boolean = false;
		
		public function Deaded() 
		{
		}
		
		override public function create():void {
			
			noiseShader.data.blendval.value = [blendvar];
			noiseShader.data.src2.input = FlxG.addBitmap(NOISE_01);
			
			faintSound = new FlxSound();
			faintSound.loadEmbedded(DEADED, false);
			faintSound.volume = 0.2;
			faintSound.play();
			
			cameraSound = new FlxSound();
			cameraSound.loadEmbedded(CRUSH_05, false);
			cameraSound.volume = 3;
			cameraSound.play();
			faintSprite = new FlxSprite(96, 56);
			add(faintSprite);
			faintSprite.loadGraphic(DEADSCREEN, true, true, 128, 128);
		
		}
		
		override public function postProcess():void
		{
		FlxG.buffer.applyFilter(screen.pixels, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), noiseFilter);
			
		coolShader.data.red.value = [red];
		coolShader.data.flash.value = [flash];
		FlxG.buffer.applyFilter(FlxG.buffer, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), coolFilter);
		}
		
		override public function update():void {
			
			if (blendvar < 0.8 ) {
			blendvar += 0.01;
			} else {
			blendvar -= 0.01;	
			}
			
			noiseShader.data.blendval.value = [blendvar];

			
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