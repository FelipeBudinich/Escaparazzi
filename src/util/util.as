package util {
    /**
     * ...
     * @author Felipe Budinich
     */
    import org.flixel.FlxU;

    public final class util {

        public static
        function rand(min: int, max: int): int {
            //Retorna un valor al azar entre el minimo y el maximo de dos enteros.
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        //Se le pasa la hora de inicio y la hora de fin en milisegundos, y devuelve la duración del intervalo de tiempo.
        public static
        function duration(start: int, end: int): String {
            var dx: int = (end - start) / 1000;
            var seconds: Number = dx % 60;
            dx /= 60;
            var minutes: Number = dx % 60;
            dx /= 60;
            var hours: Number = dx;

            return (hours < 10 ? "0" + hours : hours.toString()) + ":" +
                (minutes < 10 ? "0" + minutes : minutes.toString()) + ":" +
                (seconds < 10 ? "0" + seconds : seconds.toString());
        }

    }

}