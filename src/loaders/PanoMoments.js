/* eslint-disable */
export function PanoMoments(_0x4f1f46,_0x1716c5,_0x346b5c,_0x12040e){var _0x5d59a4=this;var _0x28420e;var _0x981671;var _0x5abbb0=[];var _0x573aa6;var _0x1a2182=document['createElement']('video');var _0x3bd8a8=[];var _0x490364;var _0x2b4725;var _0x22c8d3;var _0xd6644a;var _0x5884d9;var _0x41edbd;var _0x1e4bd3;var _0x3a3b1e;var _0x1537a9;var _0x336540=[];var _0xddcb32=-0x1;var _0x36aa75;var _0x25e1a9=[];var _0x58d4ae=0x0;var _0x1a2591=0x0;var _0x591831;var _0x5bdb02;var _0x41edbd;var _0x3cbcac;var _0x526d5a;var _0x26cbde={};var _0x4ee5fd;var _0x58a8d6;var _0x1d4fd3;var _0x323c59;var _0x2bbd59;var _0x43bcc2;var _0x2e761d;var _0x29ce5b;var _0x21159b;var _0x3aabf6=[0x74,0x66,0x64,0x74];var _0x8cd880=[0x73,0x69,0x64,0x78];var _0x1c32b1=[0x74,0x72,0x65,0x78];var _0x239b1e=[0x6d,0x64,0x68,0x64];var _0x12a0df=[0x70,0x61,0x73,0x70];var _0xe98c8e=[0x74,0x6b,0x68,0x64];if(navigator['userAgent']['match'](/Android/i)){_0x22c8d3=!![];}else if(navigator['userAgent']['match'](/iPhone|iPad|iPod/i)){_0x2b4725=!![];}if(/Chrome/i['test'](navigator['userAgent']['toLowerCase']())||/Chrome WebView/i['test'](navigator['userAgent']['toLowerCase']())||/Chromium/i['test'](navigator['userAgent']['toLowerCase']())){_0x5884d9=!![];_0xd6644a=!![];}else if(/Firefox/i['test'](navigator['userAgent']['toLowerCase']())||/Supermedium/i['test'](navigator['userAgent']['toLowerCase']())){_0x41edbd=!![];if(!_0x22c8d3){_0xd6644a=!![];}}else if(/Mobile Safari/i['test'](navigator['userAgent']['toLowerCase']())){_0x526d5a=!![];}else if(/Safari/i['test'](navigator['userAgent']['toLowerCase']())&&!/Chrome/i['test'](navigator['userAgent']['toLowerCase']())){_0x3cbcac=!![];}if(!_0xd6644a){_0x1a2182['setAttribute']('playsinline','');_0x1a2182['muted']=!![];_0x1a2182['autoplay']=!![];}else{_0x573aa6=new MediaSource();_0x1a2182['src']=window['URL']['createObjectURL'](_0x573aa6);_0x1a2182['preload']='auto';_0x573aa6['addEventListener']('sourceopen',_0x32fb34);}fetch('https://my.panomoments.com/sdk/moment',{'method':'POST','body':'private_api_key='+_0x4f1f46['private_api_key']+'&public_api_key='+_0x4f1f46['public_api_key']+'&moment_id='+_0x4f1f46['moment_id']+'&variation='+_0x4f1f46['variation']+'&sdk_client_type=web','headers':{'Content-Type':'application/x-www-form-urlencoded'}})['then'](_0x16bf22=>_0x16bf22['json']())['then'](_0x2ca577=>{_0x26cbde=_0x2ca577;_0x4ee5fd=_0x26cbde['web_mpd_url'];_0x58a8d6=_0x26cbde['web_video_url'];_0x2d3a4e();});this['currentIndex']=0x0;this['frameCount']=0x0;this['render']=function(_0x10d3e6){if(_0x591831){_0x323c59=_0x10d3e6/_0x5d59a4['frameCount']*0x168;_0x2bbd59=0x168/_0x5d59a4['frameCount'];if(!_0x26cbde['clockwise']){_0x323c59=-_0x323c59;_0x323c59=0x21c+_0x323c59;}else if(_0x323c59<0x0){_0x323c59=0x168+_0x323c59;}_0x323c59=_0x323c59%0x168;_0x1d4fd3=parseInt(Math['round'](_0x323c59/_0x2bbd59),0xa);if(_0x1d4fd3==_0x5d59a4['frameCount']&&_0x26cbde['moment_type']){_0x1d4fd3=_0x5d59a4['frameCount']-0x1;}else if(_0x1d4fd3==_0x5d59a4['frameCount']&&!_0x26cbde['moment_type']||!_0x1d4fd3){_0x1d4fd3=0x0;}if(_0x5d59a4['textureReady']()&&_0xddcb32!=_0x1d4fd3){_0x5d59a4['currentIndex']=_0x3e2112();_0x470c0b(_0x5d59a4['currentIndex']);_0xddcb32=_0x1d4fd3;}_0x1716c5(_0x1a2182,_0x26cbde);}else{console['log']('Render\x20called\x20before\x20download\x20is\x20ready.\x20Wait\x20for\x20Ready\x20callback\x20before\x20calling\x20Render.');}};this['dispose']=function(){_0x1a2182['src']='';_0x1a2182=null;_0x1716c5=null;_0x346b5c=null;_0x12040e=null;_0x28420e=null;_0x981671=null;_0x5abbb0=[];_0x573aa6=null;_0x3bd8a8['splice'](0x0,_0x3bd8a8['length']);_0x490364=null;_0x2b4725=null;_0x22c8d3=null;_0xd6644a=null;_0x5884d9=null;_0x41edbd=null;_0x1e4bd3=null;_0x3a3b1e=null;_0x1537a9=null;_0x336540=[];_0x336540['splice'](0x0,_0x336540['length']);_0xddcb32=null;_0x36aa75=null;_0x25e1a9['splice'](0x0,_0x25e1a9['length']);_0x58d4ae=null;_0x1a2591=null;_0x591831=null;_0x5bdb02=null;_0x41edbd=null;_0x3cbcac=null;_0x526d5a=null;_0x26cbde={};_0x4ee5fd=null;_0x58a8d6=null;_0x1d4fd3=null;_0x323c59=null;_0x2bbd59=null;_0x43bcc2=null;_0x2e761d=null;_0x29ce5b=null;_0x21159b=null;_0x3aabf6=[];_0x8cd880=[];_0x1c32b1=[];_0x239b1e=[];console['log']('PanoMoment\x20Web\x20SDK\x20Disposed');};this['textureReady']=function(){if(_0x41edbd&&_0x1a2182['readyState']>=0x3||_0x1a2182['readyState']===_0x1a2182['HAVE_ENOUGH_DATA']){return!![];}return![];};function _0x32fb34(){_0x28420e=_0x573aa6['addSourceBuffer']('video/mp4;\x20codecs=\x22avc1.640033\x22');_0x28420e['mode']='sequence';}function _0x2d3a4e(){_0x2c296d(_0x4ee5fd,{'responseType':'text','onreadystatechange':_0x112af7=>{const _0x531c26=_0x112af7['target'];if(_0x531c26&&_0x531c26['readyState']==_0x531c26['DONE']){var _0x4f537e=new DOMParser();var _0x287481=_0x4f537e['parseFromString'](_0x531c26['response'],'text/xml',0x0);_0x21d94d(_0x287481);if(!_0x26cbde['allow_streaming']){_0x490364=_0x5d59a4['frameCount'];}else{_0x490364=Math['min'](0x3c,_0x5d59a4['frameCount']);}_0x2facc0(_0x58a8d6);}}});}const _0x2facc0=async _0x3bcf95=>{var _0x34424b=new Headers();const _0x5be3dd='bytes='+_0x336540[0x0]['getAttribute']('range')['toString']();_0x5bdb02=_0x26cbde['aspect_ratio']?_0x26cbde['aspect_ratio']:1.7777777;if(_0x3bcf95['indexOf']('https://data.panomoments.com/')>-0x1){_0x3bcf95=_0x3bcf95['replace'](/data.panomoments.com/i,'s3.amazonaws.com/data.panomoments.com');}else if(_0x3bcf95['indexOf']('https://staging-data.panomoments.com/')>-0x1){_0x3bcf95=_0x3bcf95['replace'](/staging-data.panomoments.com/i,'s3.amazonaws.com/staging-data.panomoments.com');}_0x34424b['append']('Range',_0x5be3dd);let _0x351fca=0x0;let _0xe4405=![];while(_0x351fca<0x5&&!_0xe4405){try{const _0x3fc1a8=await fetch(_0x3bcf95,{'headers':_0x34424b,'method':'GET'});const _0x28fef3=await _0x3fc1a8['arrayBuffer']();_0x21159b=new Uint8Array(_0x28fef3);var _0x5556d2=_0x3f714e(_0x21159b,_0x12a0df);var _0x4cecdf=_0x3f714e(_0x21159b,_0xe98c8e);if(_0x4cecdf>0x0&&_0x5556d2>0x0){var _0x5cb9a3=new ArrayBuffer(0x2);var _0x9d902d=new DataView(_0x5cb9a3);_0x9d902d['setInt8'](0x0,_0x21159b[_0x4cecdf+0x50]);_0x9d902d['setInt8'](0x1,_0x21159b[_0x4cecdf+0x51]);var _0x12e13f=_0x9d902d['getUint16'](0x0);_0x12e13f=_0x12e13f['toString']();var _0x298b98=new ArrayBuffer(0x2);var _0x218ad4=new DataView(_0x298b98);_0x218ad4['setInt8'](0x0,_0x21159b[_0x4cecdf+0x52]);_0x218ad4['setInt8'](0x1,_0x21159b[_0x4cecdf+0x53]);var _0x647d08=parseFloat(_0x218ad4['getUint16'](0x0))/Math['pow'](0x2,0x10);_0x647d08=_0x647d08['toString']()['substr'](0x1);var _0x50766f=_0x12e13f['toString']()+_0x647d08['toString']();var _0x1e14ec=parseFloat(_0x21159b[_0x5556d2+0x7])/parseFloat(_0x21159b[_0x5556d2+0xb]);var _0x374055=Math['round'](parseFloat(_0x50766f)/_0x1e14ec);var _0x5e3cce=new Uint8Array([_0x207f53(_0x374055)[0x2],_0x207f53(_0x374055)[0x3]]);_0x21159b[_0x4cecdf+0x50]=_0x207f53(_0x374055)[0x2];_0x21159b[_0x4cecdf+0x51]=_0x207f53(_0x374055)[0x3];_0x21159b[_0x4cecdf+0x52]=[0x0];_0x21159b[_0x5556d2+0x7]=[0x1];_0x21159b[_0x5556d2+0xb]=[0x1];}_0x5b2a9c(_0x58a8d6);_0xe4405=!![];}catch(_0x3d7fda){console['log']('failure\x20during\x20init',_0x351fca,_0x3d7fda);_0x351fca++;}}};const _0x2228da=_0x87f18a=>{_0x3c06e1(_0x87f18a);};const _0x3c06e1=_0x58fad6=>{if((!_0x28420e||_0x28420e&&_0x28420e['updating'])&&_0x1a2591==0x0){console['log']('Buffer\x20not\x20ready.\x20Retrying\x20in\x201\x20second.');_0x43bcc2=setTimeout(()=>{_0x3c06e1(_0x58fad6);},0x3e8);return;}else if(_0x58fad6&&_0x28420e&&!_0x28420e['updating']&&_0x1a2591==0x0){_0x1a2182['currentTime']+=0x1/_0x981671;_0x28420e['timestampOffset']=_0x1a2182['currentTime'];_0x28420e['appendBuffer'](_0x58fad6);_0x1a2591++;_0x43bcc2=setTimeout(()=>{_0x3c06e1(_0x58fad6);},0x1f4);}};function _0x21d94d(_0x4d7f2b){try{var _0x1e550e=_0x4d7f2b['querySelectorAll']('Representation');_0x981671=0x1;_0x5abbb0=_0x4d7f2b['querySelectorAll']('SegmentURL');_0x336540=_0x4d7f2b['querySelectorAll']('Initialization');_0x5d59a4['frameCount']=_0x5abbb0['length'];}catch(_0x47ce48){console['log'](_0x47ce48);}}function _0x470c0b(_0x4086f6){if(_0x29ce5b==_0x4086f6)return;_0x29ce5b=_0x4086f6;if(!_0xd6644a){if(_0x2b4725||_0x41edbd){if(!_0x26cbde['aligned']){_0x1a2182['fastSeek']((_0x4086f6+framePadding)%_0x5d59a4['frameCount']*0x1/_0x981671);}else{_0x1a2182['fastSeek'](_0x4086f6*0x1/_0x981671);}}else{_0x1a2182['currentTime']=_0x4086f6*0x1/_0x981671;}}else if(_0x25e1a9[_0x4086f6]&&_0x28420e&&!_0x28420e['updating']&&_0x591831){if(_0x4086f6<_0x5d59a4['frameCount']){_0x1a2182['currentTime']+=0x1/_0x981671;_0x28420e['timestampOffset']=_0x1a2182['currentTime'];if(!_0x26cbde['aligned']){_0x28420e['appendBuffer'](_0x25e1a9[(_0x4086f6+framePadding)%_0x5d59a4['frameCount']]);}else{_0x28420e['appendBuffer'](_0x25e1a9[_0x4086f6]);}}else{console['log']('Invalid\x20Index');}}}function _0x12db8b(_0xc9bee8,_0xf52a9){_0x1e4bd3=_0x36aa75['length'];_0x3a3b1e=0x0;_0x1537a9=0x0;var _0x2c2357=0x8;if(_0x22c8d3){_0x2c2357=0x4;}for(let _0xcf48d7=0x0;_0xcf48d7<_0x2c2357;_0xcf48d7++){_0x1cbd57(_0xc9bee8,_0x490364,()=>{if(!_0x591831){_0x346b5c(_0x1a2182,_0x26cbde);_0x591831=!![];}for(let _0x254f8e=0x0;_0x254f8e<_0x2c2357;_0x254f8e++){_0x1cbd57(_0xc9bee8,_0x1e4bd3,()=>{_0x12040e(_0x1a2182,_0x26cbde);});}});}};function _0x1cbd57(_0x45f4b6,_0x3b934a,_0xf4c1a8){setTimeout(_0x540eff,0x0,_0x45f4b6,_0x3b934a,_0xf4c1a8);}async function _0x540eff(_0x36a191,_0x3f3ee1,_0x226544){let _0x40d098=0x0;while(_0x58d4ae<_0x3f3ee1){let _0x265aa7=0x0;let _0x2b9501=![];const _0x3d1db6=_0x36aa75[_0x3a3b1e++];_0x58d4ae++;while(_0x265aa7<0x3&&!_0x2b9501){const _0x495ae3=new Headers();_0x495ae3['append']('Range',_0x3d1db6['content']);_0x495ae3['append']('cache-control','no-store');_0x495ae3['append']('pragma','no-cache');_0x495ae3['append']('cache-control','no-cache');try{const _0x21307c=await fetch(_0x36a191,{'headers':_0x495ae3,'method':'GET'});const _0x26e7a0=await _0x21307c['arrayBuffer']();_0x1290f6(_0x26e7a0,_0x3d1db6['index']);_0x1537a9++;_0x2b9501=!![];}catch(_0x2eb9e3){console['log']('exception\x20during\x20chunk\x20download,\x20retrying',++_0x265aa7,_0x2eb9e3);_0x265aa7++;}finally{}}}if(_0x1537a9===_0x3f3ee1){_0x226544();}}function _0x5154dd(_0x2ff400){_0x1a2182['addEventListener']('canplaythrough',_0x23e33a,![]);_0x1a2182['addEventListener']('timeupdate',_0x668ec7,![]);var _0x45602a=new Uint8Array(_0x2ff400);var _0x13aebb=_0x3f714e(_0x21159b,_0x12a0df);var _0x531cef=_0x3f714e(_0x21159b,_0xe98c8e);if(_0x531cef>0x0&&_0x13aebb>0x0){var _0x1158e2=new ArrayBuffer(0x2);var _0x165958=new DataView(_0x1158e2);_0x165958['setInt8'](0x0,_0x45602a[_0x531cef+0x50]);_0x165958['setInt8'](0x1,_0x45602a[_0x531cef+0x51]);var _0x6c9ae3=_0x165958['getUint16'](0x0);_0x6c9ae3=_0x6c9ae3['toString']();var _0x8acf13=new ArrayBuffer(0x2);var _0x35a920=new DataView(_0x8acf13);_0x35a920['setInt8'](0x0,_0x45602a[_0x531cef+0x52]);_0x35a920['setInt8'](0x1,_0x45602a[_0x531cef+0x53]);var _0x1c1495=parseFloat(_0x35a920['getUint16'](0x0))/Math['pow'](0x2,0x10);_0x1c1495=_0x1c1495['toString']()['substr'](0x1);var _0x521115=_0x6c9ae3['toString']()+_0x1c1495['toString']();var _0x432506=parseFloat(_0x45602a[_0x13aebb+0x7])/parseFloat(_0x45602a[_0x13aebb+0xb]);var _0x5e3744=Math['round'](parseFloat(_0x521115)/_0x432506);var _0xec67ba=new Uint8Array([_0x207f53(_0x5e3744)[0x2],_0x207f53(_0x5e3744)[0x3]]);_0x45602a[_0x531cef+0x50]=_0x207f53(_0x5e3744)[0x2];_0x45602a[_0x531cef+0x51]=_0x207f53(_0x5e3744)[0x3];_0x45602a[_0x531cef+0x52]=[0x0];_0x45602a[_0x13aebb+0x7]=[0x1];_0x45602a[_0x13aebb+0xb]=[0x1];}_0x1a2182['src']=window['URL']['createObjectURL'](new Blob([_0x45602a],{'type':'video/mp4'}));_0x1a2182['pause']();}function _0x23e33a(){_0x1a2182['currentTime']=_0x5d59a4['currentIndex'];_0x2e761d=setTimeout(function(){_0x668ec7();},0x64);}function _0x668ec7(){if(_0x2e761d){clearTimeout(_0x2e761d);_0x2e761d=null;}_0x1a2182['currentTime']=_0x5d59a4['currentIndex'];_0x591831=!![];_0x346b5c(_0x1a2182,_0x26cbde);_0x12040e(_0x1a2182,_0x26cbde);_0x1a2182['removeEventListener']('canplaythrough',_0x23e33a,![]);_0x1a2182['removeEventListener']('timeupdate',_0x668ec7,![]);}function _0x2c296d(_0x2fb8b4,_0x3ea8d7){if(_0x2fb8b4!=null&&_0x2fb8b4!==''){var _0x450429=new XMLHttpRequest();_0x450429['open']('GET',_0x2fb8b4,!![]);if(_0x3ea8d7){_0x450429['responseType']=_0x3ea8d7['responseType'];if(_0x3ea8d7['onreadystatechange']){_0x450429['onreadystatechange']=_0x3ea8d7['onreadystatechange']['bind'](_0x450429);}if(_0x3ea8d7['onload']){_0x450429['onload']=_0x3ea8d7['onload'];}}_0x450429['addEventListener']('error',function(_0x4ee751){console['log']('Error:\x20'+_0x4ee751+'\x20Could\x20not\x20load\x20url.');},![]);_0x450429['send']();return _0x450429;}}const _0x5b2a9c=async _0x2c92fa=>{var _0x3bb7f9=new Headers();var _0x128f95=_0x26cbde['start_frame']+0x5a;_0x2bbd59=0x168/_0x5d59a4['frameCount'];if(!_0x26cbde['clockwise']){_0x128f95=-_0x128f95;}if(_0x128f95<0x0){_0x128f95=0x168+_0x128f95;}_0x5d59a4['currentIndex']=parseInt(Math['round'](_0x128f95/_0x2bbd59),0xa);const _0xe2c82a='bytes='+_0x5abbb0[_0x5d59a4['currentIndex']]['getAttribute']('mediaRange')['toString']();_0x3bb7f9['append']('Range',_0xe2c82a);if(_0x2c92fa['indexOf']('https://data.panomoments.com/')>-0x1){_0x2c92fa=_0x2c92fa['replace'](/data.panomoments.com/i,'s3.amazonaws.com/data.panomoments.com');}else if(_0x2c92fa['indexOf']('https://staging-data.panomoments.com/')>-0x1){_0x2c92fa=_0x2c92fa['replace'](/staging-data.panomoments.com/i,'s3.amazonaws.com/staging-data.panomoments.com');}let _0x3e59b7=0x0;let _0x1d5715=![];while(_0x3e59b7<0x5&&!_0x1d5715){try{const _0xeba062=await fetch(_0x2c92fa,{'headers':_0x3bb7f9,'method':'GET'});const _0x479274=await _0xeba062['arrayBuffer']();var _0x4e84ac=new Uint8Array(_0x479274);var _0x1ceb81=new Int8Array(_0x21159b['length']+_0x4e84ac['length']);_0x1ceb81['set'](_0x21159b);_0x1ceb81['set'](_0x4e84ac,_0x21159b['length']);if(!_0xd6644a){_0x1a2182['src']=window['URL']['createObjectURL'](new Blob([_0x1ceb81],{'type':'video/mp4'}));_0x1a2182['pause']();_0x1a2182['addEventListener']('loadedmetadata',_0x41925a);fetch(_0x58a8d6)['then'](function(_0x5e72ab){_0x5e72ab['arrayBuffer']()['then'](function(_0x2f405d){_0x5154dd(_0x2f405d);});});}else{_0x1290f6(_0x479274,_0x5d59a4['currentIndex']);_0x2228da(_0x1ceb81);_0x1716c5(_0x1a2182,_0x26cbde);_0x36aa75=_0x21de89(_0x5abbb0,_0x490364,_0x3bd8a8,![]);_0x12db8b(_0x58a8d6,0x1);}_0x1d5715=!![];}catch(_0xa705df){console['log']('failure\x20during\x20first\x20frame\x20download',_0x3e59b7,_0xa705df);_0x3e59b7++;}}};const _0x41925a=()=>{_0x1a2182['removeEventListener']('loadedmetadata',_0x41925a);_0x1716c5(_0x1a2182,_0x26cbde);};function _0x1290f6(_0x2a99f8,_0x12dd6b){_0x25e1a9[_0x12dd6b]=_0x2a99f8;}const _0x3e2112=()=>{var _0x90f1a9;if(!_0xd6644a){return _0x1d4fd3;}_0x90f1a9=_0x1d4fd3;if(_0x36aa75['length']!=0x0&&!_0x25e1a9[_0x1d4fd3]){var _0x252f27,_0x58702d,_0x101c90,_0x51c9bb=![],_0x233be6=![];_0x252f27=_0x1d4fd3;while(!_0x51c9bb&&_0x252f27<_0x5d59a4['frameCount']){if(_0x25e1a9[_0x252f27]){_0x51c9bb=!![];_0x58702d=_0x252f27;}else{_0x252f27++;}}_0x252f27=_0x1d4fd3;while(!_0x233be6&&_0x252f27>=0x0){if(_0x25e1a9[_0x252f27]){_0x233be6=!![];_0x101c90=_0x252f27;}else{_0x252f27--;}}if(!_0x58702d){_0x58702d=_0x5d59a4['frameCount'];}if(Math['abs'](_0x1d4fd3-_0x58702d)<=Math['abs'](_0x1d4fd3-_0x101c90)&&_0x58702d==_0x5d59a4['frameCount']){_0x90f1a9=0x0;}else if(Math['abs'](_0x1d4fd3-_0x58702d)<=Math['abs'](_0x1d4fd3-_0x101c90)){_0x90f1a9=_0x58702d;}else{_0x90f1a9=_0x101c90;}}else{_0x90f1a9=_0x1d4fd3;}if(!_0x90f1a9){_0x90f1a9=0x0;}return _0x90f1a9;};function _0x509d58(_0x29a714,_0x40dfec,_0x63841e,_0x3aad77,_0x50d255){return{'header':'Range','content':'bytes='+_0x29a714['getAttribute']('mediaRange')['toString'](),'index':_0x40dfec,'countPosition':_0x63841e,'firstPass':_0x3aad77,'firstPassCompleteIndex':_0x50d255};};function _0x15a360(_0x4e1b14,_0x538c09){const _0x23e9f0=_0x4e1b14['getAttribute']('mediaRange')['toString']();const _0x4e73b9=_0x538c09['getAttribute']('mediaRange')['toString']();const _0x136606=_0x23e9f0['split']('-')[0x0]+'-'+_0x4e73b9['split']('-')[0x1];return{'header':'Range','content':'bytes='+_0x136606};};function _0x21de89(_0x4ef51f,_0x3c46c3,_0x4609aa,_0x4904d9=![]){var _0x1768f1=[];var _0xaa7ad=[];var _0x3d6b58=0x0;if(_0x4904d9){for(var _0x295301=0x0;_0x295301<_0x4ef51f['length'];_0x295301++){_0x1768f1['push'](_0x509d58(_0x4ef51f[_0x295301],_0x295301,![]));}return _0x1768f1;}const _0x42ac6c=parseInt(Math['round'](_0x4ef51f['length']/_0x3c46c3),0xa);const _0x226d99=Math['ceil'](_0x4ef51f['length']/_0x3c46c3);var _0x49248d=_0x3c46c3+_0x226d99;for(var _0x295301=0x0;_0x295301<_0x49248d;_0x295301++){if(_0x4ef51f[_0x295301*_0x42ac6c]){_0x1768f1['push'](_0x509d58(_0x4ef51f[_0x295301*_0x42ac6c],_0x295301*_0x42ac6c,_0x3d6b58++,!![],_0x49248d));_0x4609aa['push'](_0x295301*_0x42ac6c);}}_0x49248d=_0x1768f1['length'];for(var _0x295301=0x0;_0x295301<_0x1768f1['length'];_0x295301++){_0x1768f1[_0x295301]['firstPassCompleteIndex']=_0x49248d;}var _0xabc194=_0x42ac6c;_0x3d6b58=0x0;for(var _0x59493c=Math['floor'](_0x42ac6c/0x2);_0x59493c>0x1;_0x59493c=Math['floor'](_0x59493c/0x2)){for(var _0x295301=0x0;_0x295301<_0x4ef51f['length']/_0xabc194;_0x295301++){if(_0x4ef51f[_0x59493c+_0x295301*_0xabc194]){_0x1768f1['push'](_0x509d58(_0x4ef51f[_0x59493c+_0x295301*_0xabc194],_0x59493c+_0x295301*_0xabc194,_0x3d6b58++,![],_0x49248d));}}_0xabc194=Math['floor'](_0x59493c/0x2);}var _0x5e7547=[];for(var _0x295301=0x0;_0x295301<_0x1768f1['length'];_0x295301++){_0x5e7547[_0x1768f1[_0x295301]['index']]=_0x1768f1[_0x295301]['index'];}for(var _0x295301=0x0;_0x295301<_0x4ef51f['length'];_0x295301++){if(!_0x5e7547[_0x295301]){_0x1768f1['push'](_0x509d58(_0x4ef51f[_0x295301],_0x295301,_0x3d6b58++,![],_0x49248d));}}function _0x4d0325(_0x2deb0d,_0x10e622){return _0x2deb0d['filter'](function(_0xa9733e,_0x41ead5,_0x486832){return _0x486832['map'](function(_0x529847){return _0x529847[_0x10e622];})['indexOf'](_0xa9733e[_0x10e622])===_0x41ead5;});}var _0x1a2701=_0x4d0325(_0x1768f1,'index');_0x1768f1=[];_0x5e7547=[];return _0x1a2701;}function _0x207f53(_0x19ae3d){var _0x2907b5=new Uint8Array([(_0x19ae3d&0xff000000)>>0x18,(_0x19ae3d&0xff0000)>>0x10,(_0x19ae3d&0xff00)>>0x8,_0x19ae3d&0xff]);return _0x2907b5;}const _0x3f714e=function(_0x1a7ca1,_0xe86e7b,_0x51b691){_0x51b691=_0x51b691||0x0;var _0x4e33ad=_0x1a7ca1['indexOf'](_0xe86e7b[0x0],_0x51b691);if(_0xe86e7b['length']===0x1||_0x4e33ad===-0x1){return _0x4e33ad;}for(var _0x2435b3=_0x4e33ad,_0x2013da=0x0;_0x2013da<_0xe86e7b['length']&&_0x2435b3<_0x1a7ca1['length'];_0x2435b3++,_0x2013da++){if(_0x1a7ca1[_0x2435b3]!==_0xe86e7b[_0x2013da]){return _0x3f714e(_0x21159b,_0xe86e7b,_0x4e33ad+0x1);}}return _0x2435b3===_0x4e33ad+_0xe86e7b['length']?_0x4e33ad:-0x1;};};