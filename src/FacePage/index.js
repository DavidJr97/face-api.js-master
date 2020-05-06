import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import mapStateToProps from './mapStateToProps';
import mapDispatchToProps from './mapDispatchToProps';
import Camera from './Camera';
import Canva from './Canva';
import * as faceapi from 'face-api.js';
import ScrollButton from './ScrollButton';

class FacePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            controller: 'game',
            loading: false,
            authorized: false,
            checkAutorization: true,
            positionIndex: 0,
            filterName: 'guate1',
            imageFilter: new Image(),
            showFilter: true,
            ejeXe: 0,
            ejeYe:68,
            landStart:63,
            landEnd: 13
        }
        this.setVideoHandler = this.setVideoHandler.bind(this);
        this.isModelLoaded = this.isModelLoaded.bind(this);
    }

    async setVideoHandler() {
        if (this.isModelLoaded() !== undefined) {
            try {
                let result = await faceapi.detectSingleFace(this.props.video.current, this.props.detector_options).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
                if (result !== undefined) {
                    console.log("face detected", 1);
                    const dims = faceapi.matchDimensions(this.props.canvas.current, this.props.video.current, true);
                    const resizedResult = faceapi.resizeResults(result, dims);
                  //  faceapi.draw.drawDetections(this.props.canvas.current, resizedResult);
                 //   faceapi.draw.drawFaceLandmarks(this.props.canvas.current, resizedResult);

                    const currentCanvas = ReactDOM.findDOMNode(this.props.canvas.current);
                    var canvasElement = currentCanvas.getContext("2d");
                    this.addFilter(canvasElement, result);
                   // this.addBoxIndexOfLandmark(canvasElement, result.landmarks.positions[this.state.positionIndex]);
                 //   this.addBackgroundInformation(canvasElement, result);
                  //  this.addGenderAndAgeInformation(canvasElement, result);
                   // this.addEmotionInformation(canvasElement, resizedResult, result);

                } else {
                    console.log("face detected", 1);
                }
            } catch (exception) {
                console.log(exception);
            }
        }
        setTimeout(() => this.setVideoHandler());
    }

   // addBoxIndexOfLandmark(canvasElement, landkmarkPosition) {
     //   let width = 10, height = 10;
      //  canvasElement.setTransform(1, 0, 0, 1, 0, 0);
      //  canvasElement.fillStyle = 'rgb(255, 87, 51)';
      //  canvasElement.fillRect(landkmarkPosition.x, landkmarkPosition.y, width, height);
       // canvasElement.closePath();
       // canvasElement.setTransform(1, 0, 0, 1, 0, 0);
   // }

    addBackgroundInformation(canvasElement, result) {
        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10;
        canvasElement.fillStyle = "black";
        canvasElement.fillRect(positionX - 45, positionY - 12, 90, 45);
    }

    addGenderAndAgeInformation(canvasElement, result) {
        // Edad y Sexo
        canvasElement.font = "10px Comic Sans MS";
        //canvasElement.font="30px Arial";
        canvasElement.fillStyle = "red";
        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10,
            gender = (result.gender) === "male" ? "Hombre" : "Mujer",
            age = "Edad: " + result.age.toFixed();
        gender = "Sexo: " + gender;

        canvasElement.textAlign = "center";
        canvasElement.fillStyle = "white";
        canvasElement.fillText(gender, positionX, positionY);
        canvasElement.fillText(age, positionX, positionY + 15);
    }

    addEmotionInformation(canvasElement, resizedResult, result) {
        const expressions = resizedResult.expressions;
        const maxValue = Math.max(...Object.values(expressions));
        let emotion = Object.keys(expressions).filter(
            item => expressions[item] === maxValue
        );
        emotion = emotion[0];
        emotion = (emotion === "happy") ? "feliz" : emotion;
        emotion = (emotion === "neutral") ? "neutral" : emotion;
        emotion = (emotion === "angry") ? "enojado" : emotion;
        emotion = (emotion === "sad") ? "triste" : emotion;
        emotion = (emotion === "surprised") ? "sorprendido" : emotion;
        emotion = (emotion === "fearful") ? "temeroso" : emotion;

        let positionX = result.landmarks.positions[8].x,
            positionY = result.landmarks.positions[8].y + 10;
        canvasElement.fillText("Emocion: " + emotion, positionX, positionY + 30);
    }

    addFilter(canvasElement, result) {
        let startIndex = 0, endIndex = 16, ajustX = (this.state.ejeXe), ajustY = (this.state.ejeYe);
        let positionX1 = result.landmarks.positions[startIndex].x - ajustX,
            positionY1 = result.landmarks.positions[startIndex].y + ajustY,
            positionX2 = result.landmarks.positions[endIndex].x + ajustX,
            positionY2 = result.landmarks.positions[endIndex].y + ajustY,
            m = ((positionY2 - positionY1) / (positionX2 - positionX1)) * 100;

        let width = positionX2 - positionX1,
            height = width * 0.8;

        positionY1 -= (height / 4);
        positionY2 -= (height / 4);

        var TO_RADIANS = Math.PI / 180,
            angleInRad = (m / 2.5) * TO_RADIANS;
        console.log("TO_RADIANS", TO_RADIANS);

        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
        canvasElement.translate(positionX1, positionY1 - 50);
        canvasElement.rotate(angleInRad);
        canvasElement.drawImage(this.state.imageFilter, 0, 0, width, height);
        /*canvasElement.translate(positionX1 ,positionY1) 
        canvasElement.translate(1,0,0,0,positionX1+(width/2),positionY1); 
        canvasElement.rotate(angleInRad);    */
        //canvasElement.drawImage(this.state.imageFilter,0,0,width,height);
        //canvasElement.restore();
        canvasElement.setTransform(1, 0, 0, 1, 0, 0);
        //this.rotateAndPaintImage(canvasElement, this.state.imageFilter, angleInRad, positionX1, positionY1,20,0 );
    }

    rotateAndPaintImage(context, image, angleInRad, positionX, positionY, axisX, axisY) {
        context.translate(positionX, positionY);
        context.rotate(angleInRad);
        context.drawImage(image, -axisX, -axisY);
        context.rotate(-angleInRad);
        context.translate(-positionX, -positionY);
    }

    isModelLoaded() {
        if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) return faceapi.nets.ssdMobilenetv1.params;
        if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) return faceapi.nets.tinyFaceDetector.params;
    }


    async componentDidMount() {
        console.log("height: " + window.screen.height + ", width: " + window.screen.width);

        // obtener parametros de configuracion y asignar el modelo que vamos a usar para reconocer rostros
        this.setDetectorOptions();
        this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);

        // asignar los archivos del model a face-api
        let modelFolder = "/models";

        let dirs = { 
         guate1: '/filter/escudo.svg',
         guate2: '/filter/banderapeque.png', 
        }
        

        let valor = 'guate1'
        try {
            await faceapi.loadFaceLandmarkModel(modelFolder);
            await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
            await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) await faceapi.nets.tinyFaceDetector.load(modelFolder);

            this.state.imageFilter.src = (dirs[valor]);
            this.state.imageFilter.onload = function () {
                console.log("image is loaded");

            }
        } catch (exception) {
            console.log("exception", exception);
        }
    }


    async componentDidUpdate() {
        console.log('El estado ha cambiado')
        this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);

        // asignar los archivos del model a face-api
        let modelFolder = "/models";

        let dirs = { 
        guate1: '/filter/escudo.svg', 
        guate2: '/filter/banderapeque.png', 
        guate3: '/filter/quetzal.png',
        guate4: '/filter/logo.png',
        guate5: '/filter/corazon.png',
        guate6: '/filter/escudoazul.png',
        guate7: '/filter/gobierno.png',
        guate8: '/filter/hojaescudo.png',
        guate9: '/filter/mano.png',
        guate10: '/filter/manoguate.png',
        guate11: '/filter/mapa.png',
        guate12: '/filter/reu.jpg',
        guate13: '/filter/volcan.png',
        guate14: '/filter/toto.png',
        guate15: '/filter/xela.jpg',
        
     }



        let valor = this.state.filterName
        try {
            await faceapi.loadFaceLandmarkModel(modelFolder);
            await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
            await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1) await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
            if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) await faceapi.nets.tinyFaceDetector.load(modelFolder);

            this.state.imageFilter.src = (dirs[valor]);
            this.state.imageFilter.onload = function () {
                console.log("image is loaded");

            }
        } catch (exception) {
            console.log("exception", exception);
        }

    }
    setDetectorOptions() {
        let minConfidence = this.props.min_confidence,
            inputSize = this.props.input_size,
            scoreThreshold = this.props.score_threshold;

        // identificar el modelo previsamente entrenado para reconocer rostos.
        // el modelo por defecto es tiny_face_detector
        let options = this.props.selected_face_detector === this.props.SSD_MOBILENETV1
            ? new faceapi.SsdMobilenetv1Options({ minConfidence })
            : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
        this.props.SET_DETECTOR_OPTIONS_IN_GAME_FACENET(options);
    }

  
switchFilter(e){
    let dirs = { 
        guate1:  {dejex: 0 , djey:130, landStart: 11, landEnd: 13},
        guate2: {dejex: 0 , djey: 65},
       }

}
    render() {
        return (
            <div>
                <Camera />
                <Canva />

                <input type="number"
                    style={{ marginLeft: 1000 }}
                    value={this.state.positionIndex}
                    onChange={(event) => { this.setState({ positionIndex: event.target.value }) }} />

                <button type="button" value='guate1' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe: 130,  landStart: 11,  landEnd: 11, width: 100, height: 100 }) }}>ESCUDO</button>
                <button type="button" value='guate2' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe: 20,  landStart: 47, landEnd: 13 }) }}>BANDERA</button>
                <button type="button" value='guate3' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe: -90 , landStart: 27, landEnd: 27 }) }}>QUETZAL</button>
                <button type="button" value='guate4' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe: 100, landStart: 8, landEnd: 10 }) }}>LOGO</button>
                <button type="button" value='guate5' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe: 125, landStart: 16, landEnd: 14 }) }}>CORAZON</button>
                <button type="button" value='guate6' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:150,  landStart: 13, landEnd: 10 }) }}>ESCUDO AZUL</button>
                <button type="button" value='guate7' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:-150,  landStart: 17, landEnd: 11, }) }}>GOBIERNO</button>
                <button type="button" value='guate8' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:80,  landStart: 17, landEnd: 11 }) }}>HOJAS ESCUDO</button>
                <button type="button" value='guate9' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:100,  landStart: 17, landEnd: 11 }) }}>MANO GUATE</button>
                <button type="button" value='guate10' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:80, landStart: 17, landEnd: 11 }) }}>MANO BANDERA</button>
                <button type="button" value='guate11' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:-125, landStart: 17, landEnd: 11 }) }}>MAPA GUATE</button>
                <button type="button" value='guate12' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:-150, landStart: 17, landEnd: 11 }) }}>BANDERA REU</button>
                <button type="button" value='guate13' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:120, landStart: 8, landEnd: 10 }) }}>VOLCANES </button>
                <button type="button" value='guate14' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:-100, landStart: 17, landEnd: 11}) }}>BANDERA TOTO</button>
                <button type="button" value='guate15' onClick={(event) => { this.setState({ filterName: event.target.value, ejeX: 0, ejeYe:-100, landStart: 17, landEnd: 11}) }}>BANDERA XELA</button>


                <h1>{this.state.filterName}</h1>
                <h1>{this.state.ejeX}</h1>
                <h1>{this.state.ejey}</h1>
                   </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FacePage);