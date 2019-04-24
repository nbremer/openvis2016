/* global d3 */

var pt = pt || {};

pt.slideIdToFunctions = {
  'title-slide': {
    'init': function() {
      pt.titleSlide.init();
    }
  },
  'intro-gradient': {
    'init': function() {
      pt.gradientIntro.init();
    }
  },
  'smooth-legend-SOM': {
    'init': function() {
      pt.legendSOM.init();
    },
    '-1': function() {
      pt.legendSOM.updateTwo();
    },
    0: function() {
      pt.legendSOM.updateMulti();
    }
  },
  'legend-code-orientation': {
    'init': function() {
      pt.legendCodeOrientation.init();
    },
    '-1': function() {
      pt.legendCodeOrientation.toBlack();
    },
    0: function() {
      pt.legendCodeOrientation.horizontal();
    },
    1: function() {
      pt.legendCodeOrientation.vertical();
    },
    2: function() {
      pt.legendCodeOrientation.diagonal();
    },
    3: function() {
      pt.legendCodeOrientation.showRect();
    },
    4: function() {
      pt.legendCodeOrientation.pullIn();
    }
  },
  'legend-code-two': {
    'init': function() {
      pt.legendCodeTwo.init();
    },
    '-1': function() {
      pt.legendCodeTwo.toBlack();
    },
    0: function() {
      pt.legendCodeTwo.hexOne();
    },
    1: function() {
      pt.legendCodeTwo.hexTwo();
    },
    2: function() {
      pt.legendCodeTwo.fillRectTwo();
    }
  },
  'legend-code-multi': {
    'init': function() {
      pt.legendCodeMulti.init();
    },
    '-1': function() {
      pt.legendCodeMulti.showHex();
    },
    0: function() {
      pt.legendCodeMulti.toBlack();
    },
    1: function() {
      pt.legendCodeMulti.fillRectMulti();
    }
  },
  'legend-code-multi-short': {
    'init': function() {
      pt.legendCodeMultiShort.init();
    }
  },
  'traffic-accidents': {
    'init': function() {
      pt.trafficAccidents.init();
    }
  },
  'weather-radial': {
    'init': function() {
      pt.weatherRadial.init();
    }
  },
  'intro-planets': {
    'init': function() {
      pt.planetsIntro.init(planets);
    }
  },
  'planets-code': {
    'init': function() {
      pt.planetsCode.init();
    },
    '-1': function() {
      pt.planetsCode.sunGradient();
    },
    1: function() {
      pt.planetsCode.oneColor();
    },
    2: function() {
      pt.planetsCode.gradientLighter();
    },
    3: function() {
      pt.planetsCode.gradientDarker();
    },
    4: function() {
      pt.planetsCode.gradientOffset();
    },
    5: function() {
      pt.planetsCode.gradientRadius();
    }
  },
  'stars-hr-diagram': {
    'init': function() {
      pt.starsHRDiagram.init(stars);
    },
    '-1': function() {
      pt.starsHRDiagram.readableSize();
    },
    0: function() {
      pt.starsHRDiagram.placeSun();
    },
    1: function() {
      pt.starsHRDiagram.trueSize();
    },
    2: function() {
      pt.starsHRDiagram.glow();
    }
  },
  'intro-orientation': {
    'init': function() {
      pt.orientationIntro.init();
    }
  },
  'orientation-grey': {
    'init': function() {
      pt.orientationGrey.init();
    },
    '-1': function() {
      pt.orientationGrey.toIndex();
    },
    0: function() {
      pt.orientationGrey.toGrey();
    },
    1: function() {
      pt.orientationGrey.highlightOne();
    },
    2: function() {
      pt.orientationGrey.placeMarkers();
    },
    3: function() {
      pt.orientationGrey.placeRect();
    }
  },
  'orientation-color-hex': {
    'init': function() {
      pt.orientationColorHex.init();
    }
  },
  'orientation-final': {
    'init': function() {
      pt.orientationFinal.init();
    }
  },
  'intro-slider': {
    'init': function() {
      pt.sliderIntro.init();
    }
  },
  'slider-move-code': {
    'init': function() {
      pt.sliderMoveCode.init();
    },
    '-1': function() {
      pt.sliderMoveCode.showFirstGrey();
    },
    0: function() {
      pt.sliderMoveCode.showFirstColored();
    },
    1: function() {
      pt.sliderMoveCode.showSecondStop();
    },
    2: function() {
      pt.sliderMoveCode.showRect();
    },
    3: function() {
      pt.sliderMoveCode.hideRect();
    }
  },
  'growth-bmi': {
    'init': function() {
      pt.growthBMI.init();
    },
    '-1': function() {
      pt.growthBMI.men();
    },
    0: function() {
      pt.growthBMI.women();
    }
  },
  'baby-names-final': {
    'init': function() {
      pt.babyNamesFinal.init();
    }
  },
  'intro-animated-gradient': {
    'init': function() {
      pt.animatedGradientIntro.init();
    }
  },
  'sankey-example': {
    'init': function() {
      pt.sankey.init();
    }
  },
  'stretched-chord': {
    'init': function() {
      pt.stretchedChord.init();
    },
    '-1': function() {
      pt.stretchedChord.step1();
    },
    0: function() {
      pt.stretchedChord.step2();
    },
    1: function() {
      pt.stretchedChord.step3();
    },
    2: function() {
      pt.stretchedChord.step4();
    },
    3: function() {
      pt.stretchedChord.step5();
    },
    4: function() {
      pt.stretchedChord.step6();
    },
    5: function() {
      pt.stretchedChord.step7();
    },
    6: function() {
      pt.stretchedChord.batplot();
    }
  },
  'stretched-chord-final': {
    'init': function() {
      pt.stretchedChordFinal.init();
    },
    '-1': function() {
      pt.stretchedChordFinal.greyChords();
    },
    0: function() {
      pt.stretchedChordFinal.animatedChords();
    }
  },
  'animated-gradient-code': {
    'init': function() {
      pt.animatedGradientCode.init();
    },
    '-1': function() {
      pt.animatedGradientCode.noAnimation();
    },
    0: function() {
      pt.animatedGradientCode.hide();
    },
    1: function() {
      pt.animatedGradientCode.noAnimation();
    },
    2: function() {
      pt.animatedGradientCode.animationX1();
    },
    3: function() {
      pt.animatedGradientCode.animationX2();
    }
  },
  'minard': {
    'init': function() {
      pt.minard.init();
    }
  },
  'intro-glow': {
    'init': function() {
      pt.glowIntro.init();
    }
  },
  'radar-chart': {
    'init': function() {
      pt.radarChart.init();
    },
    '-1': function() {
      pt.radarChart.noGlow();
    },
    0: function() {
      pt.radarChart.withGlow();
    }
  },
  'glow-code': {
    'init': function() {
      pt.glowCode.init();
    },
    0: function() {
      pt.glowCode.noGlow();
    },
    1: function() {
      pt.glowCode.withGlow();
    }
  },
  'spiro-graph': {
    'init': function() {
      pt.spiroGraph.init();
    },
    '-1': function() {
      pt.spiroGraph.noGlow();
    },
    0: function() {
      pt.spiroGraph.withGlow();
    }
  },
  'intro-fuzzy': {
    'init': function() {
      pt.fuzzyIntro.init();
    }
  },
  'fuzzy-code': {
    'init': function() {
      pt.fuzzyCode.init();
    },
    '-1': function() {
      pt.fuzzyCode.showExample();
    },
    0: function() {
      pt.fuzzyCode.noFuzzy();
    },
    1: function() {
      pt.fuzzyCode.fuzzy();
    },
  },
  'animal-speeds': {
    'init': function() {
      pt.animalSpeeds.init();
    },
    '-1': function() {
      pt.animalSpeeds.setInPlace();
    },
    0: function() {
      pt.animalSpeeds.flyOut("forward");
    },
    1: function() {
      pt.animalSpeeds.fuzzyInPlace();
    },
    2: function() {
      pt.animalSpeeds.switchImage();
    },
    3: function() {
      pt.animalSpeeds.flyOut("backward");
    }
  },
  'intro-gooey': {
    'init': function() {
      pt.gooeyIntro.init();
    }
  },
  'gooey-golf': {
    'init': function() {
      pt.gooeyGolf.init();
    },
    '-1': function() {
      pt.gooeyGolf.swingSimple();
    },
    0: function() {
      pt.gooeyGolf.swingFly();
    },
    1: function() {
      pt.gooeyGolf.swingFinal();
    }
  },
  'gooey-code': {
    'init': function() {
      pt.gooeyCode.init();
    },
    '-1': function() {
      pt.gooeyCode.moveOutIn();
    },
    0: function() {
      pt.gooeyCode.rotate();
    }
  },
  'biggest-cities': {
    'init': function() {
      pt.biggestCities.init();
    },
    '-1': function() {
      pt.biggestCities.flyOut();
    },
    0: function() {
      pt.biggestCities.placeCities();
    },
    1: function() {
      pt.biggestCities.clusterCountry();
    }
  },
  'collision-detection': {
    'init': function() {
      pt.collisionDetection.init();
    },
    '-1': function() {
      pt.collisionDetection.noGooey();
    },
    0: function() {
      pt.collisionDetection.gooey();
    }
  },
  'intro-colorAdd': {
    'init': function() {
      pt.colorAddIntro.init();
    }
  },
  'colorAdd-blend-modes': {
    'init': function() {
      pt.colorAddBlendModes.init();
    },
    0: function() {
      pt.colorAddBlendModes.isolate();
    },
    1: function() {
      pt.colorAddBlendModes.noIsolateWhite();
    },
    2: function() {
      pt.colorAddBlendModes.noIsolateBlack();
    },
    3: function() {
      pt.colorAddBlendModes.isolate();
    }
  },
  'city-temperatures': {
    'init': function() {
      pt.cityTemperatures.init();
    },
    '-1': function() {
      pt.cityTemperatures.noBlendMode();
    },
    0: function() {
      pt.cityTemperatures.withBlendMode();
    },
  },
  'slopegraph-animals': {
    'init': function() {
      pt.slopeGraphAnimals.init();
    },
    '-1': function() {
      pt.slopeGraphAnimals.noBlendMode();
    },
    0: function() {
      pt.slopeGraphAnimals.withBlendMode();
    },
  },
  'colorAdd-code': {
    'init': function() {
      pt.colorAddCode.init();
    },
    '-1': function() {
      pt.colorAddCode.screenMode();
    },
    0: function() {
      pt.colorAddCode.noMode();
    },
    1: function() {
      pt.colorAddCode.screenModeRainbow();
    },
    2: function() {
      pt.colorAddCode.screenModeGreen();
    },
    3: function() {
      pt.colorAddCode.multiplyModeGreen();
    },
    4: function() {
      pt.colorAddCode.multiplyModeRainbow();
    },
    5: function() {
      pt.colorAddCode.multiplyModePurple();
    }
  },
  'end-slide': {
    'init': function() {
      pt.endSlide.init();
    }
  }
};

function removeSVGs() {

  //Remove (heavy) all existing svgs currently running
  d3.select('#title-slide #titleSlide svg').remove();
  
  d3.select('#intro-gradient #introGradient svg').remove();
  d3.select('#traffic-accidents #trafficAccidents svg').remove();
  d3.select("#legend-code-orientation #legendCodeOrientation svg").remove();
  //d3.select('#legend-code-two #legendCodeTwo svg').remove();
  //d3.select('#legend-code-multi #legendCodeMulti svg').remove();
  //d3.select('#legend-code-multi-short #legendCodeMultiShort svg').remove();
  d3.select('#smooth-legend-SOM #SOMchart svg').remove();
  d3.select('#weather-radial #weatherRadial svg').remove();

  d3.select("#intro-planets #introPlanets svg").remove();
  d3.select("#planets-code #planetsCode svg").remove();
  d3.select("#stars-hr-diagram #starsHRDiagram svg").remove();

  d3.select('#intro-orientation #introOrientation svg').remove();
  d3.select('#orientation-grey #orientationGrey svg').remove();
  d3.select('#orientation-color-hex #orientationColorHex svg').remove();
  d3.select('#orientation-final #orientationFinal svg').remove();
  
  d3.select('#intro-slider #sliderIntro svg').remove();
  d3.selectAll('#baby-names-final svg').remove();
  d3.select('#slider-move-code #sliderMoveCode svg').remove();
  d3.select('#growth-bmi #growthBMI svg').remove();

  d3.select('#intro-animated-gradient #animatedGradientIntro svg').remove();
  d3.select('#sankey-example #sankey svg').remove();
  d3.select('#stretched-chord #stretchedChord svg').remove();
  d3.select('#stretched-chord-final #stretchedChordFinal svg').remove();
  d3.select("#animated-gradient-code #animatedGradientCode svg").remove();
  d3.select("#minard #svgMinard defs").remove();

  d3.select("#intro-gooey #introGooey svg").remove();
  d3.select('#gooey-golf #gooeyGolf svg').remove();
  d3.select('#gooey-code #gooeyCode svg').remove();
  d3.select('#biggest-cities #biggestCities svg').remove();
  d3.select('#collision-detection #collisionDetection svg').remove();

  d3.select("#intro-glow #glowIntro svg").remove();
  d3.select('#radar-chart #radarChart svg').remove();
  d3.select("#glow-code #glowCode svg").remove();
  d3.select('#spiro-graph #spiroGraph svg').remove();

  d3.select('#intro-fuzzy #introFuzzy svg').remove();
  pt.fuzzyIntro.stopRepeat = true;
  d3.select('#fuzzy-code #fuzzyCode svg').remove();
  d3.select('#animal-speeds #animalSpeeds svg').remove();

  d3.select("#intro-colorAdd #introColorAdd svg").remove();
  d3.select('#colorAdd-blend-modes #colorAddBlendModes svg').remove();
  d3.select('#city-temperatures #cityTemperatures svg').remove();
  d3.select('#slopegraph-animals #slopeGraphAnimals svg').remove();
  d3.select('#colorAdd-code #colorAddCode svg').remove();
  clearInterval(pt.colorAddCode.infinityLoop);

  d3.select('#end-slide #endSlide svg').remove();

}
