
package {
    /**
     * ...
     * @author Felipe Budinich
     */

    import org.flixel.*;

    import flash.display.Bitmap;
    import flash.display.BitmapData;
    import flash.utils.getTimer;
    import org.flixel.data.FlxKeyboard;
    import util.util;
    import util.Data;

    //Asset Registry
    import registry.AssetsRegistry;

    //Shader
    import flash.display.Shader;
    import flash.filters.*;
    import flash.geom.Point;
    import flash.geom.Rectangle;

    public class Game extends FlxState {
        //Shader
        
        private var coolShader: Shader = new Shader(new AssetsRegistry.FilterCode());
        private var coolFilter: ShaderFilter = new ShaderFilter(coolShader);
        private var offsetRX: Number = 0.0;
        private var offsetRY: Number = 0.0;
        private var flash: Number = 1.1;
        private var red: Number = 1.0;
        private var flashTimer: Number = 0.0;

        private var pointBonus: int;
        private var pointString: String;
        private var pointHUD: FlxText;
        private var currentPointHUD: FlxText;
        private var currentPointString: String;
        private var currentPointGroup: FlxGroup;

        //Burnt Pixel Shader
        private var tvShader: Shader = new Shader(new AssetsRegistry.TvShaderData());
        private var tvFilter: ShaderFilter = new ShaderFilter(tvShader);

        //scanlines overlay
        private var scanlines: FlxSprite;

        //explosions
        private var explodeSprite: FlxSprite;
        private var explodeGroup: FlxGroup;
        private var explodeTimer: Number = 0.1;

        private var popStar: FlxSprite;
        private var initialSpace_01: FlxSprite;
        private var initialSpace_02: FlxSprite;
        private var paparazzos: FlxSprite;
        private var popStarMob: FlxGroup;
        private var popStarMob_A: FlxGroup;
        private var popStarMob_B: FlxGroup;
        private var addFollower: Boolean;
        private var car: FlxSprite;
        private var carB: FlxSprite;
        private var taxi: FlxSprite;

        private var opositeTraffic: FlxGroup;
        private var opositeTrafficTimer: Number = 0.3;

        private var totalTraffic: int = 0;
        private var randomDirection: Number = 0;

        private var traffic: FlxGroup;
        private var trafficTimer: Number = 0.3;

        private var waveTimer: Number = 10.0;
        private var waveNumber: int = 0;

        private var inputTimer: Number = 15.0;
        private var emptyCar: FlxSprite;
        private var emptyOpositeCar: FlxSprite;
        private var emptyTaxi: FlxSprite;
        private var taxiLane: FlxGroup;
        private var spawnFirst: Boolean = false;

        //Moneyz
        public var moneyzAmount: int = 0;
        private var moneyzSprite: FlxSprite;
        private var moneyzPoof: FlxSprite;
        private var poofVar: FlxGroup;
        private var moneyzPurse: FlxGroup;
        private var moneyzTimer: Number = 11;
        private var moneyzHUD: FlxSprite;
        private var cashGrab: Number = 9999;

        //WINRAR IS YOU
        private var winnar: Boolean = false;
        private var winnarTimer: Number = 0.2;
        private var nextMove: int;
        private var popStarSpeed: int;
        private var countedPoints: Boolean = false;


        private var timerFoto: Number = 0;
        private var timerPaparazzi: Number = 4;
        public var fotos: int = 0;
        public var choques: int = 0;
        private var headHUD: FlxSprite;
        private var timerChoque: Number = 9999;

        public function Game() {}

        override public function preProcess(): void {
            //Burn Pixel Shader goes off when something explodes
            if (explodeGroup.members.length > 0) {
                FlxG.buffer.applyFilter(FlxG.buffer, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), tvFilter);
            } else {
                screen.fill(bgColor);
            }

            coolShader.data.flash.value = [flash];
            coolShader.data.red.value = [red];
            FlxG.buffer.applyFilter(FlxG.buffer, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), coolFilter);
        }




        override public function create(): void {
            Data.currentScore = 0;

            addFollower = false;
            popStarSpeed = 150;
            nextMove = getTimer() + popStarSpeed * 2;


            popStarMob = new FlxGroup();
            traffic = new FlxGroup();
            opositeTraffic = new FlxGroup();
            taxiLane = new FlxGroup();
            moneyzPurse = new FlxGroup();
            explodeGroup = new FlxGroup();
            poofVar = new FlxGroup();
            currentPointGroup = new FlxGroup();

            spawnNewMob(256 + 16, FlxG.height);
            spawnNewMob(256 + 32, FlxG.height);
            spawnNewMob(256 + 64, FlxG.height);
            spawnNewMob(256 + 80, FlxG.height);
            spawnNewMob(256 + 96, FlxG.height);
            spawnNewMob(256 + 112, FlxG.height);


            popStar = popStarMob.members[0];
            initialSpace_01 = popStarMob.members[1];
            initialSpace_01.solid = false;
            initialSpace_02 = popStarMob.members[2];
            initialSpace_02.solid = false;

            spawnCar(0, 0);
            emptyCar = traffic.members[0];
            emptyCar.solid = false;
            emptyCar.createGraphic(16, 16, 0x00000000);

            spawnOpositeCar(0, 0);
            emptyOpositeCar = opositeTraffic.members[0];
            emptyOpositeCar.solid = false;
            emptyOpositeCar.createGraphic(16, 16, 0x00000000);

            spawnTaxi(0, 0);
            emptyTaxi = taxiLane.members[0];
            emptyTaxi.solid = false;
            emptyTaxi.createGraphic(16, 16, 0x00000000);

            initialSpace_01.createGraphic(16, 16, 0x00000000);
            initialSpace_02.createGraphic(16, 16, 0x00000000);


            popStar.loadGraphic(AssetsRegistry.PLAYER, true, false, 16, 16, true);
            popStar.addAnimation('run', [0, 1, 2, 3, 4, 5], 12, true);
            popStar.play('run');
            popStar.facing = FlxSprite.UP;

            add(traffic);
            add(opositeTraffic);
            add(taxiLane);
            add(popStarMob);
            add(moneyzPurse);
            add(explodeGroup);
            add(poofVar);
            add(currentPointGroup);

            moneyzHUD = new FlxSprite(220, 8);
            moneyzHUD.loadGraphic(AssetsRegistry.NEED_05, true, false, 81, 18);
            add(moneyzHUD);

            headHUD = new FlxSprite(20, 8);
            headHUD.loadGraphic(AssetsRegistry.HEAD_00, true, false, 81, 18);
            add(headHUD);


            currentPointString = Data.currentScore.toString();
            currentPointHUD = new FlxText(20, 200, 240, currentPointString);
            currentPointHUD.setFormat("Nokia", 16, 0xffffffff);
            currentPointHUD.active = true;
            currentPointGroup.add(currentPointHUD);

            waveTimer = 5.5;
            FlxG.playMusic(AssetsRegistry.Chase, 1.0);

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);
        }

        override public function update(): void {

            if (spawnFirst == false) {
                spawnCar(10, util.util.rand(60, 80));
                spawnFirst = true;
            }

            waveTimer -= FlxG.elapsed;

            if (waveTimer < 0.1) {
                waveNumber += 1;
                waveTimer = 7.0;
            }

            explosionClear();
            poofClear();

            if (winnar == true) {
                winnarTimer -= FlxG.elapsed;
            }

            if (timerChoque > 0) {
                timerChoque -= FlxG.elapsed;
            } else {
                chocarSnd();
                timerChoque = 9999;
            }

            //Remove coins from play after MoneyzTimer elapses
            if (moneyzTimer > 0 && moneyzPurse.members.length > 0) {
                moneyzTimer -= FlxG.elapsed;
            } else {

                moneyzTimer = 10 - moneyzAmount;
                if (moneyzPurse.members.length > 0) {
                    //Animate and remove coin
                    moneyzPoof = new FlxSprite(moneyzPurse.members[0].x, moneyzPurse.members[0].y);
                    moneyzPoof.loadGraphic(AssetsRegistry.POOF, true, false, 8, 8);
                    moneyzPoof.addAnimation('poof', [0, 1, 2, 3], 5, false);
                    moneyzPoof.play('poof');
                    poofVar.add(moneyzPoof);
                    moneyzPurse.members.pop();
                }
            }
				switch (moneyzAmount) {
					case 0: moneyzHUD.loadGraphic(AssetsRegistry.NEED_05, true, false, 81, 18); break;
					case 1: moneyzHUD.loadGraphic(AssetsRegistry.NEED_04, true, false, 81, 18); break;
					case 2: moneyzHUD.loadGraphic(AssetsRegistry.NEED_03, true, false, 81, 18); break;
					case 3: moneyzHUD.loadGraphic(AssetsRegistry.NEED_02, true, false, 81, 18); break;
					case 4: moneyzHUD.loadGraphic(AssetsRegistry.NEED_01, true, false, 81, 18); break;
					case 5: moneyzHUD.loadGraphic(AssetsRegistry.NEED_00, true, false, 81, 18); break;
				}
			
				switch (fotos + choques) {
					
					case 0: headHUD.loadGraphic(AssetsRegistry.HEAD_00, true, false, 81, 18); break;
					case 1: headHUD.loadGraphic(AssetsRegistry.HEAD_01, true, false, 81, 18); break;
					case 2: headHUD.loadGraphic(AssetsRegistry.HEAD_02, true, false, 81, 18); break;
					case 3: headHUD.loadGraphic(AssetsRegistry.HEAD_03, true, false, 81, 18); break;
					case 4: headHUD.loadGraphic(AssetsRegistry.HEAD_04, true, false, 81, 18); break;
					case 5: headHUD.loadGraphic(AssetsRegistry.HEAD_05, true, false, 81, 18); break;
					case 6: headHUD.loadGraphic(AssetsRegistry.HEAD_06, true, false, 81, 18); break;
					case 7: headHUD.loadGraphic(AssetsRegistry.HEAD_07, true, false, 81, 18); break;
					case 8: headHUD.loadGraphic(AssetsRegistry.HEAD_08, true, false, 81, 18); break;
				}

            if (cashGrab > 0) {
                cashGrab -= FlxG.elapsed;
            } else {
                moneyzAmount += 1;
                cashGrab = 9999;

            }

            super.update();

            if (flashTimer > 0) {
                flashTimer -= FlxG.elapsed;
                flash -= 0.1;
                if (red > 1.0) {
                    red -= 0.1
                }
            } else {
                flash = 1.1;
                red = 1.0;
            }


            //Reducir Timer Fotos
            timerFoto -= FlxG.elapsed;
            //Agregar Paparazzi
            timerPaparazzi -= FlxG.elapsed

            //timer input
            if (winnar == false) {
                inputTimer -= FlxG.elapsed;

                if (FlxG.keys.UP && popStar.facing == FlxSprite.UP || FlxG.keys.W && popStar.facing == FlxSprite.UP) {

                } else if (FlxG.keys.DOWN && popStar.facing == FlxSprite.DOWN || FlxG.keys.S && popStar.facing == FlxSprite.DOWN) {

                } else if (FlxG.keys.LEFT && popStar.facing == FlxSprite.LEFT || FlxG.keys.A && popStar.facing == FlxSprite.LEFT) {

                } else if (FlxG.keys.RIGHT && popStar.facing == FlxSprite.RIGHT || FlxG.keys.D && popStar.facing == FlxSprite.RIGHT) {

                } else if (FlxG.keys.UP || FlxG.keys.DOWN || FlxG.keys.LEFT || FlxG.keys.RIGHT || FlxG.keys.A || FlxG.keys.S || FlxG.keys.D || FlxG.keys.W) {

                    inputTimer = 15.0;

                }

            }

            if (timerPaparazzi < 0) {

                addFollower = true;
                timerPaparazzi = 1;

                if (popStarSpeed > 140 && moneyzAmount > 1 && moneyzAmount <= 2) {

                    popStarSpeed -= 1;
                } else if (popStarSpeed > 110 && moneyzAmount > 2 && moneyzAmount <= 3) {

                    popStarSpeed -= 2;
                } else if (popStarSpeed > 100 && moneyzAmount > 3 && moneyzAmount <= 4) {

                    popStarSpeed -= 3;
                } else if (popStarSpeed > 90 && moneyzAmount > 4 && moneyzAmount <= 5) {

                    popStarSpeed -= 4;
                }
            }
            //	Colisión

            if (winnar == false) {
                FlxU.overlap(popStar, popStarMob, deadpopStar);
                FlxU.overlap(popStar, traffic, chocar);
                FlxU.overlap(popStar, opositeTraffic, chocarOposite);
            }

            FlxU.overlap(popStar, taxiLane, win);
            FlxU.overlap(traffic, traffic, correrse);
            FlxU.overlap(traffic, opositeTraffic, correrse);
            FlxU.overlap(opositeTraffic, opositeTraffic, correrse);
            FlxU.overlap(popStarMob, traffic, deadPaparazzo);
            FlxU.overlap(popStarMob, opositeTraffic, deadOpositePaparazzo);
            FlxU.overlap(popStar, moneyzPurse, kaching);

            /*if (FlxG.keys.ESCAPE) {
					moneyzAmount = 5;
				}*/

            if ((FlxG.keys.UP || FlxG.keys.W) && popStar.facing != FlxSprite.DOWN) {
                popStar.facing = FlxSprite.UP;
            } else if ((FlxG.keys.DOWN || FlxG.keys.S) && popStar.facing != FlxSprite.UP) {
                popStar.facing = FlxSprite.DOWN;
            } else if ((FlxG.keys.LEFT || FlxG.keys.A) && popStar.facing != FlxSprite.RIGHT) {
                popStar.facing = FlxSprite.LEFT;
            } else if ((FlxG.keys.RIGHT || FlxG.keys.D) && popStar.facing != FlxSprite.LEFT) {
                popStar.facing = FlxSprite.RIGHT;
            }

            if (getTimer() > nextMove) {
                moveMob();
                SpawnMOAR();
                moveTraffic();
                moveOpositeTraffic();
                fadeBonus();
                nextMove = getTimer() + popStarSpeed;
            }

        }

        private function correrse(object_1: FlxObject, object_2: FlxObject): void {

            if (object_1.x >= object_2.x) {
                object_2.x -= 6;
                object_1.x += 6;
            } else {
                object_1.x -= 6;
                object_2.x += 6;
            }
            if (object_1.y >= object_2.y) {
                object_2.y -= 6;
                object_1.y += 6;
            } else {
                object_1.y -= 6;
                object_2.y += 6;
            }
        }

        private function chocarSnd(): void {

            switch (util.util.rand(1, 5)) {
            case 1:
                FlxG.play(AssetsRegistry.CRUSH_01);
                break;
            case 2:
                FlxG.play(AssetsRegistry.CRUSH_02);
                break;
            case 3:
                FlxG.play(AssetsRegistry.CRUSH_03);
                break;
            case 4:
                FlxG.play(AssetsRegistry.CRUSH_04);
                break;
            case 5:
                FlxG.play(AssetsRegistry.CRUSH_05);
                break;
            }
        }

        private function chocar(object1: FlxObject, object2: FlxObject): void {
            Data.currentScore += 100;
            currentPointString = Data.currentScore.toString();
            currentPointHUD.text = currentPointString;

            pointBonus = 100;
            pointString = pointBonus.toString();
            pointHUD = new FlxText(object1.x, object1.y, 120, pointString);
            pointHUD.setFormat("Nokia", 8, 0x55ffff55);
            currentPointGroup.add(pointHUD);

            //Hack culiao feo X-D
            if (timerChoque > 1) {
                timerChoque = 0.1;
            }


            if (timerFoto < 0) {
                choques += 1;
                red = 1.5;
                flashTimer = 0.1;
                timerFoto = 0.4 * FlxU.random() + 0.1;
            }

            if (choques + fotos > 8) {
                FlxG.state = new Deaded();
            }
            FlxG.quake.start(0.01, 0.1);
            traffic.remove(object2, true);
            explosion(object2.x, object2.y);


            if (traffic.members.length < 5) {
                SpawnMOAR();
            }

        }

        private function chocarOposite(object1: FlxObject, object2: FlxObject): void {
            Data.currentScore += 100;
            currentPointString = Data.currentScore.toString();
            currentPointHUD.text = currentPointString;

            pointBonus = 100;
            pointString = pointBonus.toString();
            pointHUD = new FlxText(object1.x, object1.y, 120, pointString);
            pointHUD.setFormat("Nokia", 8, 0x55ffff55);
            currentPointGroup.add(pointHUD);

            //Hack culiao feo X-D
            if (timerChoque > 1) {
                timerChoque = 0.1;
            }

            if (timerFoto < 0) {
                choques += 1;
                red = 1.5;
                flashTimer = 0.1;
                timerFoto = 0.4 * FlxU.random() + 0.1;
            }

            if (choques + fotos > 8) {
                FlxG.state = new Deaded();
            }
            FlxG.quake.start(0.01, 0.1);
            opositeTraffic.remove(object2, true);
            explosion(object2.x, object2.y);


            if (opositeTraffic.members.length < 5) {
                SpawnMOAR();
            }

        }


        private function deadPaparazzo(object1: FlxObject, object2: FlxObject): void {
            Data.currentScore += 250;
            currentPointString = Data.currentScore.toString();
            currentPointHUD.text = currentPointString;

            pointBonus = 250;
            pointString = pointBonus.toString();
            pointHUD = new FlxText(object1.x, object1.y, 120, pointString);
            pointHUD.setFormat("Nokia", 8, 0x55ffff55);
            currentPointGroup.add(pointHUD);

            //Buscar referencia para remover del array
            if (popStarMob.members.indexOf(object1) > 0) {

                popStarMob.remove(object1, true);
                traffic.remove(object2, true);
                if (traffic.members.length < 5) {
                    spawnCar(util.util.rand(-10, 0), util.util.rand(60, 180));
                }
            }

            if (moneyzPurse.members.length < 1) {
                addManey(object1.x, object1.y);
            }

            explosion(object1.x, object1.y);

            //Hack
            if (timerChoque > 1) {
                timerChoque = 0.1;
            }

        }

        private function fadeBonus(): void {
            if (currentPointGroup.members.length > 1) {
                currentPointGroup.members.pop();
            }
        }

        private function deadOpositePaparazzo(object1: FlxObject, object2: FlxObject): void {
            Data.currentScore += 250;
            currentPointString = Data.currentScore.toString();
            currentPointHUD.text = currentPointString;
            //
            pointBonus = 250;
            pointString = pointBonus.toString();
            pointHUD = new FlxText(object1.x, object1.y, 120, pointString);
            pointHUD.setFormat("Nokia", 8, 0x55ffff55);
            currentPointGroup.add(pointHUD);


            //Search for the dead paparazzi to remove from the array
            if (popStarMob.members.indexOf(object1) > 0) {

                popStarMob.remove(object1, true);
                opositeTraffic.remove(object2, true);
                if (opositeTraffic.members.length < 5) {
                    spawnOpositeCar(util.util.rand(-10, 0), util.util.rand(60, 180));
                }
            }

            if (moneyzPurse.members.length < 1) {
                addManey(object1.x, object1.y);
            }

            explosion(object1.x, object1.y);

            //Hack culiao feo X-D
            if (timerChoque > 1) {
                timerChoque = 0.1;
            }

        }



        private function deadpopStar(object1: FlxObject, object2: FlxObject): void {

            if (timerFoto < 0) {

                cameraFlash(object1.x, object1.y);

                fotos += 1;
                flash = 1.5;
                flashTimer = 0.1;
                timerFoto = 0.4 * FlxU.random() + 0.1;
                switch (util.util.rand(1, 5)) {
                case 1:
                    FlxG.play(AssetsRegistry.Camara_01);
                    break;
                case 2:
                    FlxG.play(AssetsRegistry.Camara_02);
                    break;
                case 3:
                    FlxG.play(AssetsRegistry.Camara_03);
                    break;
                case 4:
                    FlxG.play(AssetsRegistry.Camara_04);
                    break;
                case 5:
                    FlxG.play(AssetsRegistry.Camara_05);
                    break;
                }
            }

            if (fotos + choques > 8) {
                FlxG.state = new Paparazzed();
            }

        }

        private function SpawnMOAR(): void {

            randomDirection = util.util.rand(-1, 1);

            if (randomDirection > 0) {
                if (trafficTimer < 0 && traffic.members.length < 5) {
                    spawnCar(util.util.rand(-10, 0), util.util.rand(60, 180));
                    trafficTimer = 2.0;
                }
            } else {
                if (opositeTrafficTimer < 0 && opositeTraffic.members.length < 5) {
                    spawnOpositeCar(util.util.rand(320, 310), util.util.rand(60, 180));
                    opositeTrafficTimer = 2.0;
                }
            }

        }

        private function moveTraffic(): void {

            if (trafficTimer < 1 && moneyzAmount > 3 && taxiLane.members.length < 2) {
                spawnTaxi(0, util.util.rand(32, 96));
                trafficTimer = 2.0;
            }

            if (winnar == false) {
                trafficTimer -= FlxG.elapsed;

                for (var s: int = traffic.members.length - 1; s > 0; s--) {
                    traffic.members[s].x += 16;
                    traffic.members[s].y += util.util.rand(-8, 8);

                    if (traffic.members[s].x > 320) {
                        traffic.members[s].x = -32;
                        traffic.members[s].y = util.util.rand(32, 224);
                    }

                    if (traffic.members[s].y > 240) {
                        traffic.members[s].y = 16;
                    }

                    if (traffic.members[s].y < 0) {
                        traffic.members[s].y = 224;
                    }
                }

                for (var z: int = taxiLane.members.length - 1; z > 0; z--) {
                    taxiLane.members[z].x += 16;
                    taxiLane.members[z].y += util.util.rand(-4, 4);

                    if (taxiLane.members[z].x > 320) {
                        taxiLane.members[z].x = -32;
                    }

                    if (taxiLane.members[z].y > 240) {
                        taxiLane.members[z].y = 16;
                    }

                    if (taxiLane.members[z].y < 0) {
                        taxiLane.members[z].y = 224;
                    }
                }
            }
        }

        private function moveOpositeTraffic(): void {

            if (winnar == false) {
                opositeTrafficTimer -= FlxG.elapsed;

                for (var s: int = opositeTraffic.members.length - 1; s > 0; s--) {
                    opositeTraffic.members[s].x -= 16;
                    opositeTraffic.members[s].y += util.util.rand(-8, 8);

                    if (opositeTraffic.members[s].x < -32) {
                        opositeTraffic.members[s].x = 320;
                        opositeTraffic.members[s].y = util.util.rand(32, 224);
                    }

                    if (opositeTraffic.members[s].y > 240) {
                        opositeTraffic.members[s].y = 16;
                    }

                    if (opositeTraffic.members[s].y < 0) {
                        opositeTraffic.members[s].y = 224;
                    }
                }

            }
        }


        private function moveMob(): void {


            if (winnar == false) {
                var oldX: int = popStar.x;
                var oldY: int = popStar.y;

                if (addFollower) {
                    var addX: int = popStarMob.members[popStarMob.members.length - 1].x * 2;
                    var addY: int = popStarMob.members[popStarMob.members.length - 1].y * 2;
                }

                switch (popStar.facing) {
                case FlxSprite.LEFT:
                    if (popStar.x == 0) {
                        popStar.x = FlxG.width - 16;
                    } else if (inputTimer < 0.1) {

                    } else {
                        popStar.x -= 16;
                    }
                    break;

                case FlxSprite.RIGHT:
                    if (popStar.x == FlxG.width - 16) {
                        popStar.x = 0;
                    } else if (inputTimer < 0.1) {

                    } else {
                        popStar.x += 16;
                    }
                    break;

                case FlxSprite.UP:
                    if (popStar.y == 0) {
                        popStar.y = FlxG.height - 16;
                    } else if (inputTimer < 0.1) {

                    } else {
                        popStar.y -= 16;
                    }
                    break;

                case FlxSprite.DOWN:
                    if (popStar.y == FlxG.height - 16) {
                        popStar.y = 0;
                    } else if (inputTimer < 0.1) {

                    } else {
                        popStar.y += 16;
                    }
                    break;
                }



                for (var s: int = popStarMob.members.length - 1; s > 0; s--) {

                    if (s == 1) {
                        popStarMob.members[s].x = oldX + util.util.rand(-4, 4);
                        popStarMob.members[s].y = oldY + util.util.rand(-4, 4);
                    } else {
                        popStarMob.members[s].x = popStarMob.members[s - 1].x + util.util.rand(-4, 4);
                        popStarMob.members[s].y = popStarMob.members[s - 1].y + util.util.rand(-4, 4);
                    }
                }


                if (addFollower) {
                    switch (util.util.rand(1, (1 + moneyzAmount))) {
                    case 1:
                        spawnNewMob(oldX, oldY);
                        break;

                    case 2:
                        spawnNewMob(oldX, oldY);
                        break;

                    case 3:
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        break;

                    case 4:
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        break;

                    case 5:
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        break;

                    case 6:
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        break;

                    case 7:
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        spawnNewMob(oldX, oldY);
                        break;
                    }

                    addFollower = false;
                }
            }
        }

        private function spawnNewMob(_x: int, _y: int): void {

            paparazzos = new FlxSprite(_x, _y);
            switch (util.util.rand(1, 5)) {
            case 1:
                paparazzos.loadGraphic(AssetsRegistry.PAPARAZZO_01, true, false, 16, 16, true);
                break;
            case 2:
                paparazzos.loadGraphic(AssetsRegistry.PAPARAZZO_02, true, false, 16, 16, true);
                break;
            case 3:
                paparazzos.loadGraphic(AssetsRegistry.PAPARAZZO_03, true, false, 16, 16, true);
                break;
            case 4:
                paparazzos.loadGraphic(AssetsRegistry.PAPARAZZO_04, true, false, 16, 16, true);
                break;
            case 5:
                paparazzos.loadGraphic(AssetsRegistry.PAPARAZZO_05, true, false, 16, 16, true);
                break;
            }

            paparazzos.addAnimation('run', [0, 1, 2, 3, 4, 5], 12, true);
            paparazzos.play('run');
            popStarMob.add(paparazzos);


        }

        private function spawnCar(_x: int, _y: int): void {

            car = new FlxSprite(_x, _y);
            switch (util.util.rand(1, 4)) {
            case 1:
                car.loadGraphic(AssetsRegistry.CAR_01, true, false, 32, 16, true);
                break;
            case 2:
                car.loadGraphic(AssetsRegistry.CAR_02, true, false, 32, 16, true);
                break;
            case 3:
                car.loadGraphic(AssetsRegistry.CAR_03, true, false, 32, 16, true);
                break;
            case 4:
                car.loadGraphic(AssetsRegistry.CAR_04, true, false, 32, 16, true);
                break;
            }
            car.addAnimation('engine', [0, 1], 12, true);
            car.play('engine');
            traffic.add(car);

        }

        private function spawnOpositeCar(_x: int, _y: int): void {

            carB = new FlxSprite(_x, _y);
            switch (util.util.rand(1, 4)) {
            case 1:
                carB.loadGraphic(AssetsRegistry.CARB_01, true, false, 32, 16, true);
                break;
            case 2:
                carB.loadGraphic(AssetsRegistry.CARB_02, true, false, 32, 16, true);
                break;
            case 3:
                carB.loadGraphic(AssetsRegistry.CARB_03, true, false, 32, 16, true);
                break;
            case 4:
                carB.loadGraphic(AssetsRegistry.CARB_04, true, false, 32, 16, true);
                break;
            }
            carB.addAnimation('engine', [0, 1], 12, true);
            carB.play('engine');
            opositeTraffic.add(carB);

        }


        private function spawnTaxi(_x: int, _y: int): void {
            taxi = new FlxSprite(_x, _y);
            taxi.loadGraphic(AssetsRegistry.TAXI, true, false, 32, 16, true);
            taxi.addAnimation('engine', [0, 1], 12, true);
            taxi.play('engine');
            taxiLane.add(taxi);
        }


        private function win(object1: FlxObject, object2: FlxObject): void {
            if (moneyzAmount > 4) {

                winnar = true;

                if (popStarMob.members.length > 3) {
                    for (var i: int = popStarMob.members.length - 1; i > 0; i--) {
                        winComplicated();
                    }
                } else {
                    if (winnarTimer <= 0) {
                        FlxG.state = new Winrar();
                    }
                }

            }
        }

        private function winComplicated(): void {
            if (countedPoints == false) {

                Data.currentScore += (popStarMob.members.length - 3) * 1000;

                if (Data.currentScore > Data.highScore) {
                    Data.highScore = Data.currentScore;

                }
                currentPointString = Data.currentScore.toString();
                countedPoints = true;
            }

            if (winnarTimer <= 0) {
                explodeSprite = new FlxSprite(popStarMob.members[popStarMob.members.length - 1].x, popStarMob.members[popStarMob.members.length - 1].y);
                explodeSprite.loadGraphic(AssetsRegistry.MANEY_WIN, true, false, 32, 32);
                explodeSprite.addAnimation('bling', [0, 1], 5, true);
                explodeSprite.play('bling');

                pointBonus = 1000;
                pointString = pointBonus.toString();
                pointHUD = new FlxText(popStarMob.members[popStarMob.members.length - 1].x, popStarMob.members[popStarMob.members.length - 1].y - 24, 120, pointString);
                pointHUD.setFormat("Nokia", 16, 0xffffff55);
                currentPointHUD.text = currentPointString;

                explodeGroup.add(explodeSprite);
                explodeGroup.add(pointHUD);
                popStarMob.members.pop();
                switch (util.util.rand(1, 5)) {
                case 1:
                    FlxG.play(AssetsRegistry.COIN_01);
                    break;
                case 2:
                    FlxG.play(AssetsRegistry.COIN_02);
                    break;
                case 3:
                    FlxG.play(AssetsRegistry.COIN_03);
                    break;
                case 4:
                    FlxG.play(AssetsRegistry.COIN_04);
                    break;
                case 5:
                    FlxG.play(AssetsRegistry.COIN_05);
                    break;
                }

                winnarTimer = 0.1;

            }
        }

        private function addManey(_x: int, _y: int): void {
            moneyzSprite = new FlxSprite(_x, _y);
            moneyzSprite.loadGraphic(AssetsRegistry.MANEY, true, false, 8, 8);
            moneyzSprite.addAnimation('bling', [0, 1], 5, true);
            moneyzSprite.play('bling');
            moneyzPurse.add(moneyzSprite);
        }

        private function explosion(_x: int, _y: int): void {
            explodeSprite = new FlxSprite(_x, _y);
            switch (util.util.rand(1, 4)) {
            case 1:
                explodeSprite.loadGraphic(AssetsRegistry.EXPLODE_01, true, false, 32, 32);
                break;
            case 2:
                explodeSprite.loadGraphic(AssetsRegistry.EXPLODE_02, true, false, 32, 32);
                break;
            case 3:
                explodeSprite.loadGraphic(AssetsRegistry.EXPLODE_03, true, false, 32, 32);
                break;
            case 4:
                explodeSprite.loadGraphic(AssetsRegistry.EXPLODE_04, true, false, 32, 32);
                break;
            }
            explodeGroup.add(explodeSprite);
        }

        private function cameraFlash(_x: int, _y: int): void {
            explodeSprite = new FlxSprite(_x, _y);
            explodeSprite.loadGraphic(AssetsRegistry.POOF, true, false, 8, 8);
            explodeSprite.addAnimation('poof', [0, 1, 2, 3], 24, false);
            explodeSprite.play('poof');
            explodeGroup.add(explodeSprite);
        }

        private function explosionClear(): void {
            if (explodeGroup.members.length >= 1) {
                explodeTimer -= FlxG.elapsed;
            }

            if (explodeTimer <= 0 && explodeGroup.members.length >= 1) {

                for (var i: int = explodeGroup.members.length; i > 0; i--) {
                    explodeGroup.members.pop();
                }
                explodeTimer = 0.1;
            }

        }

        private function poofClear(): void {
            if (poofVar.members.length >= 1) {
                if (moneyzPoof.finished) {
                    poofVar.members.pop();
                }
            }

        }

        private function kaching(object1: FlxObject, object2: FlxObject): void {
            Data.currentScore += 500;
            currentPointString = Data.currentScore.toString();
            currentPointHUD.text = currentPointString;

            pointBonus = 500;
            pointString = pointBonus.toString();
            pointHUD = new FlxText(object1.x, object1.y, 120, pointString);
            pointHUD.setFormat("Nokia", 8, 0x55ffff55);
            currentPointGroup.add(pointHUD);

            moneyzPurse.members.pop();

            cashGrab = 0.3;
            switch (util.util.rand(1, 5)) {
            case 1: FlxG.play(AssetsRegistry.COIN_01); break;
            case 2: FlxG.play(AssetsRegistry.COIN_02); break;
            case 3: FlxG.play(AssetsRegistry.COIN_03); break;
            case 4: FlxG.play(AssetsRegistry.COIN_04); break;
            case 5: FlxG.play(AssetsRegistry.COIN_05); break;
            }
        }
    }

}