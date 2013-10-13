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
	import org.flixel.data.FlxKeyboard;
	import util.Data;
	
		//Shader
	import flash.display.Shader;
	import flash.filters.*;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	 
	public class Intro extends FlxState
	{
		
		[Embed(source = '../assets/gfx/intro.png')] private static const INTRO:Class;
		[Embed(source='../assets/snd/intro_click.mp3')] protected var INTROSND:Class;
		
		
		//Screen Noise
		[Embed(source = '../assets/shader/blend.pbj', mimeType = "application/octet-stream")] protected var noiseShaderData:Class;
		private var noiseShader:Shader = new Shader(new noiseShaderData());
		private var noiseFilter:ShaderFilter = new ShaderFilter(noiseShader);
		[Embed(source = '../assets/gfx/noise_01.png')] private static const NOISE_01:Class;
		private var blendvar:Number = 1.0;
		
		private var introSprite:FlxSprite;
		private var introSnd:FlxSound;
		
		public function Intro() 
		{
		}
		
		override public function create():void {
			noiseShader.data.blendval.value = [blendvar];
			noiseShader.data.src2.input = FlxG.addBitmap(NOISE_01);
			
			introSprite = new FlxSprite(40, 0, INTRO);
			this.add(introSprite);
			introSnd = new FlxSound();
			introSnd.loadEmbedded(INTROSND);
			FlxG.mouse.show();

			trace(Data.highScore);
		}
		
		override public function update():void {
			

			if (blendvar < 0.8 ) {
			blendvar += 0.01;
			} else {
			blendvar -= 0.01;	
			}
			
			noiseShader.data.blendval.value = [blendvar];
			
			if (FlxG.mouse.justReleased()) 
			{
				introSnd.play();
				FlxG.state = new Game();
			}
			
			if (FlxG.keys.R && FlxG.keys.E) {

				Data.reset();
			} else if (FlxKeyboard.any() && FlxG.keys.R == false && FlxG.keys.E == false){
				FlxG.state = new Game();
			}
			
			
		}
		
		override public function postProcess():void
		{
			FlxG.buffer.applyFilter(screen.pixels, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), noiseFilter);
		}
	}

}