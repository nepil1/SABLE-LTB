VANTA.NET({
    el: "#intro",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x505050,
    backgroundColor: 0x0,
    points: 12.00,
    maxDistance: 21.00,
    showDots: false
  })




  var maxSumm = 1450000, // Максимальная сумма вклада
  minSumm = 0, // Минимальная сумма вклада
  startSumm = 100000, // Сумма вклада по-умолчанию (первоначальный взнос)

  maxRefill = 1000000, // Максимальная сумма ежемесячного пополнения
  minRefill = 0, // Минимальная сумма ежемесячного пополнения
  startRefill = 20000, // Ежемесячное пополнение по-умолчанию

  maxTerm = 24, // Максимальный срок вклада
  minTerm = 1, // Минимальный срок вклада
  startTerm = 7, // Срок вклада по-умолчанию

  rate = 3, // Процентная ставка (годовых)

  term = [1, 7, 30]
  // =====================================================================

// Считаем доход и проценты
//ToDo: mRefill - заменить на дневное пополнение либо убрать
function calcDeposit(summ, mRefill, rate, term) {
  function clearNum(num) { return Number(String(num).replace(/[^0-9]/g, '')) };
  summ = clearNum(summ);
  mRefill = clearNum(mRefill);
  term = clearNum(term);
  var mRate = rate,
      deposit = summ;

  //!!!
  mRefill = 0;
  //!!!
  for (var i = 0; i < term; i++) {
      i == term - 1 ? refill = 0 : refill = mRefill;
      deposit += deposit * mRate / 100 + refill;
  }

  var percent = deposit - (summ + mRefill * (term - 1));

  deposit = Math.round(deposit);
  percent = Math.round(percent);
  var calcDepo = {
      depo: deposit,
      perc: percent
  }
  return calcDepo;
}

// Диаграмма калькулятора
function diagramm(blockID, start, refill, perc) {
  function getRadians(degrees) {
      return (Math.PI / 180) * degrees
  }

  function createArc(color, width, radius, rad, clockwise) {
      canvasContent.strokeStyle = color;
      canvasContent.lineWidth = width;
      canvasContent.beginPath();
      canvasContent.arc(150, 150, radius, 0, rad, clockwise);
      canvasContent.stroke();
  }
  var canvas = document.getElementById(blockID),
      borderRad = getRadians(360),
      startRad = getRadians(start),
      refillRad = getRadians(refill),
      percRad = getRadians(perc),
      canvasContent = canvas.getContext('2d');
  canvasContent.clearRect(0, 0, 300, 300);

  createArc('#cccccc', 1, 139, borderRad, false);
  createArc('#D8D8D8', 6, 137, -startRad, true);
  createArc('#979797', 6, 137, refillRad, false);
  createArc('#404040', 16, 132, -percRad, true);
}

// Получаем значения слайдов
function getSliders() {
  var curSumm = $('#bcalc_inputSummLabel').val();
  var curRefill = $('#bcalc_inputRefillLabel').val();
  var curTerm = $('#bcalc_inputTermLabel').val();
  var curSliders = {
      start: Number(String(curSumm).replace(/[^0-9]/g, '')),
      refill: Number(String(curRefill).replace(/[^0-9]/g, '')),
      term: Number(String(curTerm).replace(/[^0-9]/g, ''))
  }
  return curSliders;
}

// Установка значений полей ручного ввода
function setInputVal(summ, refill, term) {
  var summInput = $('#bcalc_inputSummLabel');
  var refillInput = $('#bcalc_inputRefillLabel');
  var termInput = $('#bcalc_inputTermLabel');

  summInput.attr('value', summ);
  refillInput.attr('value', refill);
  termInput.attr('value', term);
}

/*
* Создание слайдов [ползунков]
*
* slideID      : String, ID блока со слкайдом
* inputID      : String, ID блока со текущим значением слайда
* minValue     : Int, минимальное значение слайда
* maxValue     : Int, максимальное значение слайда
* defaultValue : Int, значение слайда при загрузке калькулятора
* defaultStep  : Int, шаг с которым изменяется значение слайда при перетаскивании ползунка
* nonLinear    : Bool, включение/выключение нелинейной зависимости шага
* rate         : Int, процентная ставка
* 
*/


function createSlides(slideID, inputID, minValue, maxValue, defaultValue, defaultStep, nonLinear, rate) {

  var slideBlock = document.getElementById(slideID);
  var inputBlock = document.getElementById(inputID);

  if (nonLinear) {
      slideRange = {
          min: [minValue],
          '33%': [100000, defaultStep],
          '66%': [maxValue / 4, defaultStep],
          max: [maxValue]
      }
  } else {
      slideRange = {
          min: minValue,
          max: maxValue
      }
  }
  noUiSlider.create(slideBlock, {
      connect: [true, false],
      behaviour: 'tap',
      step: defaultStep,
      start: defaultValue,
      range: slideRange
  });
  slideBlock.noUiSlider.on('slide', function(values, handle) {

      var curValue = Math.round(values[handle]);
      inputBlock.value = numDevider(curValue);

      var sliders = getSliders();
      var calc = getCalc(sliders)
      setDiagramValues(calc)

      setSlidersValues(sliders, calc)
  });
  inputBlock.addEventListener('change', function() {

      var manualInput = Number(this.value.replace(/[^0-9]/g, ''));
      if (manualInput > maxValue) manualInput = maxValue;
      if (manualInput < minValue) manualInput = minValue;
      this.value = numDevider(manualInput);
      slideBlock.noUiSlider.set([manualInput, null]);

      var sliders = getSliders();
      var calc = getCalc(sliders)
      setDiagramValues(calc)

      setSlidersValues(sliders, calc)
  });
}

// Делит число на разряды [ 10503000 => 10 503 000 ] 
function numDevider(data) {
  var res = String(data).replace(/[^0-9]/g, '');
  return res.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
}

var summInput = $('#bcalc_inputSumm');
var refillInput = $('#bcalc_refill');
var termInput = $('#bcalc_inputTerm');

createSlides('bcalc_inputSumm', 'bcalc_inputSummLabel', minSumm, maxSumm, startSumm, 1000, true, rate);
createSlides('bcalc_inputRefill', 'bcalc_inputRefillLabel', minRefill, maxRefill, startRefill, 1000, true, rate);
createSlides('bcalc_inputTerm', 'bcalc_inputTermLabel', minTerm, maxTerm, startTerm, 1, false, rate);

function getCalc(sliders) {

  return [calcDeposit(sliders.start, sliders.refill, rate, term[0]),
      calcDeposit(sliders.start, sliders.refill, rate, term[1]),
      calcDeposit(sliders.start, sliders.refill, rate, term[2])
  ]
}

function setDiagramValues(calc) {
  $('.calcdepo__percval').text(numDevider(calc.perc));
  $('.calcdepo__termval').text(term);
  for (let i = 0; i < calc.length; i++) {
      $('#bcalc__resultSumm' + i).text(numDevider(calc[i].depo));
  }
}

function setSlidersValues(sliders, calc) {


  for (let i = 0; i < 3; i++) {
      var total = sliders.start + sliders.refill * term[i];
      summPerc = sliders.start * 100 / total;
      summDeg = 360 / 100 * summPerc;

      refillPerc = (sliders.refill * term[i]) * 100 / total;
      refillDeg = 360 / 100 * refillPerc;

      percPerc = calc[i].perc * 100 / total;
      percDeg = 360 / 100 * percPerc;
      diagramm('bcalc__diagrammCanvas' + i, summDeg, refillDeg, percDeg);
  }

}

$(document).ready(function() {

  // Значение по-умолчанию для полей ручного ввода
  setInputVal(numDevider(startSumm), numDevider(startRefill), numDevider(startTerm));

  var sliders = getSliders();
  var calc = getCalc(sliders)
  setDiagramValues(calc)

  setSlidersValues(sliders, calc);

});
  