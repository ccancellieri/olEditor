/*
 *  olEditor - Open Source geospatial batch processing system
 *  Author: Carlo Cancellieri - GeoSolutions SAS
 *  Site: http://geo-solutions.it/
 *  Copyright (C) 2013-2014 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var map, vectors, formats, controls, snap;
OpenLayers.ProxyHost = "http://localhost:8080/";

function updateFormats() {
	var in_options = {
		'internalProjection' : map.baseLayer.projection,
		'externalProjection' : new OpenLayers.Projection(OpenLayers.Util
				.getElement("inproj").value)
	};
	var out_options = {
		'internalProjection' : map.baseLayer.projection,
		'externalProjection' : new OpenLayers.Projection(OpenLayers.Util
				.getElement("outproj").value)
	};
	var gmlOptions = {
		featureType : "feature",
		featureNS : "http://example.com/feature"
	};
	var gmlOptionsIn = OpenLayers.Util.extend(OpenLayers.Util.extend({},
			gmlOptions), in_options);
	var gmlOptionsOut = OpenLayers.Util.extend(OpenLayers.Util.extend({},
			gmlOptions), out_options);
	var kmlOptionsIn = OpenLayers.Util.extend({
		extractStyles : true
	}, in_options);
	formats = {
		'in' : {
			wkt : new OpenLayers.Format.WKT(in_options),
			geojson : new OpenLayers.Format.GeoJSON(in_options),
			georss : new OpenLayers.Format.GeoRSS(in_options),
			gml2 : new OpenLayers.Format.GML.v2(gmlOptionsIn),
			gml3 : new OpenLayers.Format.GML.v3(gmlOptionsIn),
			kml : new OpenLayers.Format.KML(kmlOptionsIn),
			atom : new OpenLayers.Format.Atom(in_options),
			gpx : new OpenLayers.Format.GPX(in_options),
			encoded_polyline : new OpenLayers.Format.EncodedPolyline(in_options)
		},
		'out' : {
			wkt : new OpenLayers.Format.WKT(out_options),
			geojson : new OpenLayers.Format.GeoJSON(out_options),
			georss : new OpenLayers.Format.GeoRSS(out_options),
			gml2 : new OpenLayers.Format.GML.v2(gmlOptionsOut),
			gml3 : new OpenLayers.Format.GML.v3(gmlOptionsOut),
			kml : new OpenLayers.Format.KML(out_options),
			atom : new OpenLayers.Format.Atom(out_options),
			gpx : new OpenLayers.Format.GPX(out_options),
			encoded_polyline : new OpenLayers.Format.EncodedPolyline(
					out_options)
		}
	};
}

function init() {

	// allow testing of specific renderers via "?renderer=Canvas", etc
	var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
	renderer = (renderer) ? [ renderer ]
			: OpenLayers.Layer.Vector.prototype.renderers;
	vectors = new OpenLayers.Layer.Vector("WFS", {
		options : [ {
			numZoomLevels : 22
		} ]
	});

	map = new OpenLayers.Map({
		div : "map",
		layers : [ new OpenLayers.Layer.Google("Google Hybrid", {
			type : google.maps.MapTypeId.HYBRID,
			numZoomLevels : 22,
			visibility : false
		}), new OpenLayers.Layer.Google("Google Satellite", {
			type : google.maps.MapTypeId.SATELLITE,
			numZoomLevels : 22
		}), new OpenLayers.Layer.Google("Google Streets", {
			numZoomLevels : 22,
			visibility : false
		}),
		// the SATELLITE layer has all 22 zoom level, so we add it first to
		// become the internal base layer that determines the zoom levels of
		// the map.
		new OpenLayers.Layer.Google("Google Physical", {
			type : google.maps.MapTypeId.TERRAIN,
			numZoomLevels : 22,
			visibility : false
		}), new OpenLayers.Layer.Google("Google Streets", // the default
		{
			numZoomLevels : 22,
			visibility : false
		}), new OpenLayers.Layer.OSM(), new OpenLayers.Layer("Blank", {
			numZoomLevels : 22,
			isBaseLayer : true
		}),
		// world,
		vectors ],
		center : new OpenLayers.LonLat(0, 0),
	// fractionalZoom : true,
	// zoom: 1,
	// numZoomLevels : 22,
	// controls : [ new OpenLayers.Control.LayerSwitcher(),
	// new OpenLayers.Control.Attribution(),
	// new OpenLayers.Control.PanZoomBar(),
	// new OpenLayers.Control.Navigation({
	// zoomWheelEnabled : true,
	// cumulative : false,
	// mouseWheelOptions : {
	// interval : 100,
	// maxDelta : 1
	// }
	// }), new OpenLayers.Control.MousePosition() ]
	});

	OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';

	// map.addLayer(vectors);
	// map.addLayers([wms, vectors]);
	// map.addControl(new OpenLayers.Control.LayerSwitcher());
	// map.addControl(new OpenLayers.Control.MousePosition());
	// map.addControl(new OpenLayers.Control.Navigation(
	// {zoomWheelEnabled : true, mouseWheelOptions : { cumulative: false,
	// interval: 200, maxDelta: 1} }
	// ));
	// map.addControl(new OpenLayers.Control.EditingToolbar(vectors));
	map.zoomToMaxExtent();

	// var options = {
	// hover : true,
	// onSelect : serialize
	// };
	// var select = new OpenLayers.Control.SelectFeature(vectors, options);
	// map.addControl(select);
	// select.activate();

	updateFormats();

	// add file selector
	// document.getElementById('files').addEventListener('change',
	// handleFileSelect, false);

	// configure the snapping agent
	snap = new OpenLayers.Control.Snapping({
		layer : vectors
	});
	map.addControl(snap);
	snap.activate();
	// add behavior to snap elements
	var snapCheck = document.getElementById("snap_toggle");
	snapCheck.checked = true;
	snapCheck.onclick = function() {
		if (snapCheck.checked) {
			snap.activate();
		} else {
			snap.deactivate();
		}
	};

	// selection
	vectors.events
			.on({
				'featureselected' : function(feature) {
					document.getElementById('counter').innerHTML = this.selectedFeatures.length;
				},
				'featureunselected' : function(feature) {
					document.getElementById('counter').innerHTML = this.selectedFeatures.length;
				}
			});

	if (console && console.log) {
		function report(event) {
			console.log(event.type, event.feature ? event.feature.id
					: event.components);
		}
		;
		vectors.events.on({
			"beforefeaturemodified" : report,
			"featuremodified" : report,
			"afterfeaturemodified" : report,
			"vertexmodified" : report,
			"sketchmodified" : report,
			"sketchstarted" : report,
			"sketchcomplete" : report,
			"featureselected" : report,
			"featureunselected" : report
		});
	}
	controls = {
		switcher : new OpenLayers.Control.LayerSwitcher(),
		attribution : new OpenLayers.Control.Attribution(),
		pan : new OpenLayers.Control.PanZoomBar(),
		navigation : new OpenLayers.Control.Navigation({
			zoomWheelEnabled : true,
			cumulative : false,
			mouseWheelOptions : {
				interval : 100,
				maxDelta : 1
			}
		}),
		mouse : new OpenLayers.Control.MousePosition(),
		point : new OpenLayers.Control.DrawFeature(vectors,
				OpenLayers.Handler.Point),
		line : new OpenLayers.Control.DrawFeature(vectors,
				OpenLayers.Handler.Path),
		polygon : new OpenLayers.Control.DrawFeature(vectors,
				OpenLayers.Handler.Polygon),
		regular : new OpenLayers.Control.DrawFeature(vectors,
				OpenLayers.Handler.RegularPolygon, {
					handlerOptions : {
						sides : 5
					}
				}),
		modify : new OpenLayers.Control.ModifyFeature(vectors),
		select : new OpenLayers.Control.SelectFeature(vectors, {
			clickout : false,
			toggle : false,
			multiple : false,
			hover : false,
			toggleKey : "ctrlKey", // ctrl key removes from selection
			multipleKey : "shiftKey", // shift key adds to selection
			box : true
		}),
		selecthover : new OpenLayers.Control.SelectFeature(vectors, {
			multiple : false,
			hover : true,
			toggleKey : "ctrlKey", // ctrl key removes from selection
			multipleKey : "shiftKey" // shift key adds to selection
		})
	};

	for ( var key in controls) {
		map.addControl(controls[key]);
	}
	document.getElementById('noneToggle').checked = true;

	map.setCenter(new OpenLayers.LonLat(0, 0), 3);

	// make map fullscreen
	updateFullMap();
	window.onresize = function() {
		updateFullMap();
	};

	// make tools draggable
	$("#toolMaster").draggable();

}

// sets the map <div> to the inner window size
function updateFullMap() {
	var mapdiv = document.getElementById('map');
	// console.log("doc height:"+$(document).height());
	// console.log("doc width:"+$(document).width());
	// console.log("wind height:"+$(window).height());
	// console.log("wind width:"+$(window).width());

	// mapdiv.style.height = $(document).height() + "px";
	// mapdiv.style.width = $(document).width() + "px";

	mapdiv.style.height = $(window).height() - 2 + "px";
	mapdiv.style.width = $(window).width() - 2 + "px";
	// mapdiv.style.height = (window.innerHeight-2) + "px";
	// mapdiv.style.width = (window.innerWidth-2) + "px";
	// mapdiv.style.Width = "99%";
	setTimeout(function() {
		map.updateSize();
	}, 200);
}

function unselectAll() {
	controls['select'].unselectAll();
}

function selectAll() {
	unselectAll();
	for ( var i = 0; i < vectors.features.length; i++) {
		controls['select'].select(vectors.features[i]);
	}
}

function configureModifyFeature(config, value) {
	if (config == "reshape") {
		if (value) {
			controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
		}
	} else if (config == "createVertices") {
		controls.modify.createVertices = value;
	} else if (config == "rotate") {
		if (value) {
			controls.modify.mode = OpenLayers.Control.ModifyFeature.ROTATE;
		}
	} else if (config == "resize") {
		if (value) {
			controls.modify.mode = OpenLayers.Control.ModifyFeature.RESIZE;
		}
	} else if (config == "keepAspectRatio") {
		controls.modify.keepAspectRatio = value;
	} else if (config == "drag") {
		if (value) {
			controls.modify.mode = OpenLayers.Control.ModifyFeature.DRAG;
		}
	}
}

function configurePolygon(config, value) {
	if (config == "sides") {
		var sides = Math.max(3, isNaN(value) ? 0 : value);
		controls.regular.handler.sides = sides;
	} else if (config == "irregular") {
		controls.regular.handler.irregular = value;
	}
}

function toggleControl(element) {
	for (key in controls) {
		var control = controls[key];
		if (element == key) {
			control.activate();
		} else {
			control.deactivate();
		}
	}
}

function removeSelected() {
	vectors.removeFeatures(vectors.selectedFeatures, {
		silent : true
	});
}

function removeAll() {
	vectors.removeFeatures(vectors.features, {
		silent : true
	});
}

function convertSelectedToPolygon() {
	var features = vectors.selectedFeatures;
	var ring = convertToRing(features, new OpenLayers.Geometry.LinearRing());
	polygonFeature = new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Polygon([ ring ]), null, null); // site_style
	vectors.addFeatures([ polygonFeature ]);
}

function convertToRing(features, ring) {
	for ( var fid in features) {
		if (features[fid] instanceof OpenLayers.Geometry.Point) {
			ring.addComponent(features[fid].clone());
		} else if (features[fid].geometry instanceof OpenLayers.Geometry.Point) {
			ring.addComponent(features[fid].geometry.clone());
		} else if (features[fid].geometry instanceof OpenLayers.Geometry.Collection) {
			ring = convertToRing(features[fid].geometry.components, ring);
		} else {
			ring = convertToRing(features[fid].components, ring);
		}
	}
	return ring;
}

function convertSelectedToPoints() {
	var features = vectors.selectedFeatures;
	var points = convertToPoints(features);
}

function convertToPoints(features) {
	for ( var fid in features) {
		if (features[fid] instanceof OpenLayers.Geometry.Point) {
			vectors.addFeatures([ new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point(features[fid].x,
							features[fid].y)) ]);
		} else if (features[fid].geometry instanceof OpenLayers.Geometry.Point) {
			vectors.addFeatures([ new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point(features[fid].geometry
							.clone())) ]); // TODO check
		} else if (features[fid].geometry instanceof OpenLayers.Geometry.Collection) {
			convertToPoints(features[fid].geometry.components);
		} else {
			convertToPoints(features[fid].components);
		}
	}
}

// ///////////////////////////////////////////////////CHECKME
function convertSelectedToPolygon2() {
	var selectedFeatures = vectors.selectedFeatures;
	var points = convertToPoints2(selectedFeatures);
	// var rings[];
	var rings = new Array();
	for ( var i = 0, l = points.length; i < l; i++) {
		rings[i] = convertToRing(points[i],
				new OpenLayers.Geometry.LinearRing());
		polygonFeature = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Polygon([ rings[i] ]), null, null); // site_style
		vectors.addFeatures([ polygonFeature ]);
	}
	vectors.removeFeatures(vectors.selectedFeatures);
}

function convertToPoints2(features) {
	// var points[][];
	var points = new Array();
	var i = 0;
	for ( var fid in features) {
		var j = 0;
		points[i] = new Array();
		if (features[fid].geometry instanceof OpenLayers.Geometry.Collection) {
			for ( var comp in features[fid].geometry.components) {
				j = j + 1;
				var point = convertFeatureToPoint(features[fid].geometry.components[comp]);
				if (!point) {
					// comp is not a Point geometry
					merge(
							points,
							convertToPoints2(features[fid].geometry.components[comp]));
				} else {
					points[i][j] = point;
				}
			}
			// } else if (features[fid].components instanceof
			// OpenLayers.Geometry.Collection){
			// // points[i++]=convertToPoints2(features[fid]);
			// //points[i++]=convertFeatureToPoint(features[fid].components);
			// for (var comp in features[fid].components){
			// j=j+1;
			// var
			// point=convertFeatureToPoint(features[fid].geometry.components[comp]);
			// if (!point){
			// // comp is not a Point geometry
			// merge(points,convertToPoints2(features[fid].geometry.components[comp]));
			// } else {
			// points[i][j]=point;
			// }
			// }
		}
		i = i + 1;
	}
	return points;
}

function merge(matrix1, matrix2) {
	var l1 = matrix1.length;
	for ( var i = 0, l2 = matrix2.length; i < l2; i++) {
		matrix1[i + l1] = matrix2[i];
	}
}

function convertFeatureToPoint(feature) {
	var point;
	var i = 0;
	if (feature instanceof OpenLayers.Geometry.Point) {
		point = new OpenLayers.Geometry.Point(feature.x, feature.y);
	} else if (feature.geometry instanceof OpenLayers.Geometry.Point) {
		point = feature.geometry.clone(); // TODO check
	} else
		return null;
	return point;
}

// ///////////////////////////////////////////////////CHECKME

function addPointFeature(pointGeom) {
	polygonFeature = new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(pointGeom), null, null); // site_style
	vectors.addFeatures([ polygonFeature ]);
}

function serialize(feature) {
	var type = document.getElementById("exporterFormatType").value;
	// second argument for pretty printing (geojson only)
	var pretty = document.getElementById("exporterPrettyPrint").checked;
	var str = formats['out'][type].write(feature, pretty);
	// not a good idea in general, just for this demo
	str = str.replace(/,/g, ', ');
	document.getElementById('exporterText').value = str;
}

function serializeSelected() {
	serialize(vectors.selectedFeatures);
}

function deserialize() {
	var element = document.getElementById('importerText');
	var type = document.getElementById("importerFormatType").value;
	var features = formats['in'][type].read(element.value);

	if (features) {

		zoomToFeatures(features);

		map.zoomToExtent(bounds);
		var plural = (features.length > 1) ? 's' : '';
		element.value = features.length + ' feature' + plural + ' added';
	} else {
		element.value = 'Bad input ' + type;
	}
}

function zoomToSelectedFeatures() {
	zoomToFeatures(vectors.selectedFeatures);
}

function zoomToFeatures(features) {
	if (features) {
		if (features.constructor != Array) {
			features = [ features ];
		}
		var bounds = null;
		if (features.length > 0) {
			for ( var i = 0; i < features.length; ++i) {
				if (!bounds) {
					bounds = features[i].geometry.getBounds();
				} else {
					bounds.extend(features[i].geometry.getBounds());
				}

			}
			vectors.addFeatures(features);
			map.zoomToExtent(bounds);
		}
	}
}

// ///////////////////////////////////////////////////CHECKME
function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// Loop through the FileList and render image files as thumbnails.
	for ( var i = 0, f; f = files[i]; i++) {

		// Only process image files.
		var type = document.getElementById("importerFormatType").value;
		// if (!f.type.match(type)) {
		// continue;
		// }

		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				// append feature
				var features = formats['in'][type].read(e.target.result);
				if (features) {
					if (features.constructor != Array) {
						features = [ features ];
					}

					vectors.addFeatures(features);

					var plural = (features.length > 1) ? 's' : '';
					element.value = features.length + ' feature' + plural
							+ ' added';
				} else {
					element.value = 'Bad input ' + type;
				}
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsText(f, 'UTF-8')
	}
}

function loadFile(file) {
	var input = $("input:file");
	var type = document.getElementById("importerFormatType").value;
	var features = formats['in'][type].read(input.value);
	if (features) {
		if (features.constructor != Array) {
			features = [ features ];
		}
		vectors.addFeatures(features);
		// map.zoomToExtent(bounds);
		var plural = (features.length > 1) ? 's' : '';
		element.value = features.length + ' feature' + plural + ' added';
	} else {
		element.value = 'Bad input ' + type;
	}
}
// ///////////////////////////////////////////////////CHECKME

// ////////////// SIMPLIFY

// Control behaviour
function simplifySelected() {
	simplify(vectors.selectedFeatures);
}

var lastValue = 1;
function simplify(features) {
	var min = 0;
	var max = 10000;
	var givenVal = parseFloat(document.getElementById('tolerance').value);
	var useVal = lastValue;
	if (!isNaN(givenVal)) {
		if (givenVal >= min && givenVal <= max) {
			useVal = givenVal;
		} else {
			useVal = (givenVal < min) ? min : max;
		}
	}

	// WORKAROUND Done due to the refresh draw error
	toggleControl('select');

	for ( var i = 0; i < features.length; ++i) {
		if (features[i].geometry instanceof OpenLayers.Geometry.LineString) {
			var newLineString = features[i].geometry.simplify(useVal);
			var originalVerticesCnt = features[i].geometry.components.length;
			var simplifiedVerticesCnt = newLineString.getVertices().length;
			vectors.removeFeatures(features[i]);
			vectors.destroyFeatures(features[i]);
			var feature = new OpenLayers.Feature.Vector(newLineString);
			vectors.addFeatures([ feature ]);
			vectors.drawFeature(feature);

			alert("Feature n. "
					+ i
					+ " decreased by "
					+ (((originalVerticesCnt - simplifiedVerticesCnt) / originalVerticesCnt) * 100)
							.toFixed(2) + "%.");
			// var infotxt = '<ul><li>Original LineString: <strong>';
			// infotxt += originalVerticesCnt + ' vertices</strong></li>';
			// infotxt += ' <li>Simplified geometry: <strong>' +
			// simplifiedVerticesCnt + ' vertices</strong></li>';
			// infotxt += ' <li>Decreased by <strong>' +
			// (((originalVerticesCnt-simplifiedVerticesCnt)/originalVerticesCnt)*100).toFixed(2)
			// + ' per cent</strong></li></ul>';
			// document.getElementById('info').innerHTML = infotxt;
		}
	}
	lastValue = useVal;
	document.getElementById('tolerance').value = lastValue;
};

// /////////////SIMPLIFY ANIMATED

// unused
var animationInterval;
function animationHandler() {
	if (document.getElementById('animation').text === 'Start animation') {
		document.getElementById('simplify').disabled = true;
		document.getElementById('animation').text = "Stop animation";
		animationInterval = window.setInterval(
				function() {
					var tolerance = parseFloat(document
							.getElementById('tolerance').value);
					if (tolerance < 1) {
						tolerance += 0.01;
					} else {
						tolerance = 0.01;
					}
					document.getElementById('tolerance').value = tolerance
							.toFixed(2);
					simplify();
				}, 2000);
		simplify();
	} else {
		if (animationInterval) {
			window.clearInterval(animationInterval);
		}
		document.getElementById('simplify').disabled = false;
		document.getElementById('animation').text = "Start animation";
	}
};

// ///////////////////// LABELs
function label(layer, features) {
	for ( var fid = 0; fid < features.length; ++fid) {
		layer.drawFeature(features[fid], {
			label : String(fid),
			labelOffsetX : "10",
			labelOffsetY : "10",
			fontColor : "red",
			fontSize : 12,
			fontFamily : "Arial",
			fontWeight : "bold",
			labelAlign : "lt"
		});
	}
};

function labelize() {
	label(vectors, vectors.selectedFeatures);
};

/*
 * $(document).ready(function(){ init();
 * 
 * var map = $("#map"); map.css("height", $("#controls").height());
 * 
 * 
 * });
 */
