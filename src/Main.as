package 
{
	/**
	 * Escaparazzi
	 * @author Felipe Budinich
	 */

	import org.flixel.*;
	import util.Data;

	[SWF(width = "640", height = "480", frameRate = "60", backgroundColor = "#000000")]
	
	
	public class Main extends FlxGame
	{
		private var screenRatio:int;
		
		public function Main():void 
		{
			
				screenRatio = 2;
			
			Data.load();
			super(320, 240, Game, screenRatio);
			
		}
		
	}
	
}