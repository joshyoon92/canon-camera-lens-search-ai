"""Builds data/cameras.json and data/lenses.json.
Every record carries `source` / `priceSource`:
  - "usa.canon.com/2026-10-20": roster + price read from the live Canon USA store listing
  - "press/2026": specs from 2026 launch coverage (models newer than general knowledge)
  - "knowledge-unverified": from general knowledge; verify before publishing
"""
import json

SITE = "usa.canon.com/2026-10-20"
K = "knowledge-unverified"
P = "https://www.usa.canon.com/shop/p/"

def cam(id, name, type, mount, sensor, mp, fps_e, fps_m, vres, fps4k, raw, open_gate, log, ibis, evf,
        vari, sealed, fan, weight, dims, slots, price, reg, level, tags, src, price_src, url=None, extra=None):
    d = dict(id=id, name=name, category="camera", type=type, mount=mount, sensor=sensor,
             megapixels=mp, burstFpsElectronic=fps_e, burstFpsMechanical=fps_m,
             video=dict(maxResolution=vres, max4kFps=fps4k, rawInternal=raw, openGate=open_gate, log=log),
             ibis=ibis, evf=evf, variAngleScreen=vari, weatherSealing=sealed, coolingFan=fan,
             weightG=weight, dimensionsMm=dims, cardSlots=slots,
             priceUSD=price, regularPriceUSD=reg, level=level, useTags=tags,
             source=src, priceSource=price_src, productUrl=url, imageUrl=None)
    if extra: d.update(extra)
    return d

cameras = [
 # ---------- Mirrorless: roster + price from the live body-only listing ----------
 cam("eos-r1","EOS R1","mirrorless","RF","full_frame",24.2,40,12,"6K",120,True,False,True,True,True,True,"pro",False,1115,[157.6,149.5,87.3],"2x CFexpress B",6799,None,"pro",["sports","wildlife","events","news"],K,SITE,P+"eos-r1"),
 cam("eos-r3","EOS R3","mirrorless","RF","full_frame",24.1,30,12,"6K",120,True,False,True,True,True,True,"pro",False,1015,[150,142.6,87.2],"CFexpress B + SD",4399,5399,"pro",["sports","wildlife","events"],K,SITE,P+"eos-r3"),
 cam("eos-r5-mark-ii","EOS R5 Mark II","mirrorless","RF","full_frame",45,30,12,"8K",120,True,False,True,True,True,True,"advanced",False,746,[138.5,101.5,93.5],"CFexpress B + SD",4099,4399,"advanced",["landscape","wildlife","portrait","video","weddings"],K,SITE,P+"eos-r5-mark-ii"),
 cam("eos-r5","EOS R5","mirrorless","RF","full_frame",45,20,12,"8K",120,True,False,True,True,True,True,"advanced",False,738,[138.5,97.5,88],"CFexpress B + SD",2999,3299,"advanced",["landscape","portrait","weddings","wildlife"],K,SITE,P+"eos-r5"),
 cam("eos-r5-c","EOS R5 C","mirrorless","RF","full_frame",45,20,12,"8K",120,True,False,True,False,True,True,"advanced",True,770,[142,101,111],"CFexpress B + SD",3199,3899,"advanced",["video","filmmaking"],K,SITE,P+"eos-r5-c"),
 cam("eos-r6-mark-iii","EOS R6 Mark III","mirrorless","RF","full_frame",32.5,40,12,"7K",120,True,True,True,True,True,True,"advanced",False,699,None,"CFexpress B + SD",2799,None,"advanced",["hybrid","weddings","events","wildlife","video"],"press/2026",SITE,P+"eos-r6-mark-iii"),
 cam("eos-r6-v","EOS R6 V","mirrorless","RF","full_frame",32.5,40,None,"7K",120,True,True,True,True,False,True,"advanced",True,598,None,"CFexpress B + SD",2499,None,"intermediate",["video","vlogging","filmmaking"],"press/2026",SITE,P+"eos-r6-v",
     dict(notes="Video-first body: no EVF, active cooling fan. Reports conflict on the mechanical shutter; treated as electronic-only. Weight is from a pre-launch leak.")),
 cam("eos-r6-mark-ii","EOS R6 Mark II","mirrorless","RF","full_frame",24.2,40,12,"4K",60,False,False,True,True,True,True,"advanced",False,670,[138.4,98.4,88.4],"2x SD",1999,2299,"intermediate",["hybrid","events","weddings","low_light"],K,SITE,P+"eos-r6-mark-ii"),
 cam("eos-r8-mark-ii","EOS R8 Mark II","mirrorless","RF","full_frame",24.2,40,None,"4K",60,False,False,True,True,True,True,"basic",False,546,[131.4,90.0,79.7],"1x SD (UHS-II)",1899,None,"intermediate",["travel","hybrid","street","portrait"],"press/2026",SITE,P+"eos-r8-mark-ii-camera-body",
     dict(notes="Announced Sep 2026; IBIS rated 7.5 stops; adds AF joystick.")),
 cam("eos-r8","EOS R8","mirrorless","RF","full_frame",24.2,40,6,"4K",60,False,False,True,False,True,True,"basic",False,461,[132.5,86.1,70.0],"1x SD",1399,1649,"intermediate",["travel","street","portrait","beginner_full_frame"],K,SITE,P+"eos-r8"),
 cam("eos-rp","EOS RP","mirrorless","RF","full_frame",26.2,5,5,"4K",24,False,False,False,False,True,True,"basic",False,485,[132.5,85,70],"1x SD",899,1149,"beginner",["beginner_full_frame","travel"],K,SITE,P+"eos-rp"),
 cam("eos-r7","EOS R7","mirrorless","RF","aps_c",32.5,30,15,"4K",60,False,False,True,True,True,True,"advanced",False,612,[132,90.4,91.7],"2x SD",1649,None,"advanced",["wildlife","birds","sports"],K,SITE,P+"eos-r7"),
 cam("eos-r10","EOS R10","mirrorless","RF","aps_c",24.2,23,15,"4K",60,False,False,False,False,True,True,"basic",False,429,[122.5,87.8,83.4],"1x SD",1099,None,"beginner",["beginner","sports","travel"],K,SITE,P+"eos-r10"),
 cam("eos-r50","EOS R50","mirrorless","RF","aps_c",24.2,15,12,"4K",30,False,False,False,False,True,True,"none",False,375,[116.3,85.5,68.8],"1x SD",729.99,779.99,"beginner",["beginner","vlogging","travel"],K,SITE,P+"eos-r50"),
 cam("eos-r50-v","EOS R50 V","mirrorless","RF","aps_c",24.2,15,None,"4K",60,False,False,True,False,False,True,"none",False,370,None,"1x SD",619.99,719.99,"beginner",["vlogging","content_creation"],K,SITE,P+"eos-r50-v-body",
     dict(notes="No EVF; vertical tripod socket; 4K60 is cropped.")),
 cam("eos-r100","EOS R100","mirrorless","RF","aps_c",24.1,6.5,6.5,"4K",24,False,False,False,False,True,False,"none",False,356,[116.3,85.5,68.8],"1x SD",479,None,"beginner",["beginner"],K,K,None,
     dict(notes="Not in the body-only listing (kit-only); price is an approximate kit price.")),
 # ---------- DSLR: roster not re-fetched; verify ----------
 cam("eos-5d-mark-iv","EOS 5D Mark IV","dslr","EF","full_frame",30.4,7,7,"4K",30,False,False,True,False,True,False,"advanced",False,890,[150.7,116.4,75.9],"CF + SD",1999,2499,"advanced",["landscape","weddings","portrait"],K,SITE,P+"eos-5d-mark-iv",
     dict(variants=[dict(name="EOS 5D Mark IV with Canon Log",priceUSD=2599,url=P+"eos-5d-mark-iv-with-canon-log")])),
 cam("eos-rebel-t7","EOS Rebel T7","dslr","EF","aps_c",24.1,3,3,"1080p",None,False,False,False,False,True,False,"none",False,475,[129,101.3,77.6],"1x SD",499.99,579.99,"beginner",["beginner"],K,SITE,None,dict(kitOnly=True,notes="Sold only as kits on usa.canon.com; price is the EF-S 18-55 IS II kit.")),
 # ---------- Compacts: fixed lens; roster not re-fetched; verify ----------
 cam("powershot-v1","PowerShot V1","compact","fixed","1_4_inch",22.3,30,None,"4K",60,False,False,True,False,False,True,"none",True,426,None,"1x SD",899,None,"intermediate",["vlogging","travel","content_creation"],K,K,None,
     dict(fixedLens=dict(focalEquivMm=[16,50],aperture=[2.8,4.5]))),
 cam("powershot-g7x-mark-iii","PowerShot G7 X Mark III","compact","fixed","1_inch",20.1,30,8.3,"4K",30,False,False,False,False,False,True,"none",False,304,[105.5,60.9,41.4],"1x SD",749,None,"beginner",["vlogging","travel","everyday"],K,K,None,
     dict(fixedLens=dict(focalEquivMm=[24,100],aperture=[1.8,2.8]))),
 cam("powershot-v10","PowerShot V10","compact","fixed","1_inch",20.1,None,None,"4K",30,False,False,False,False,False,False,"none",False,211,None,"1x SD",429,None,"beginner",["vlogging","content_creation"],K,K,None,
     dict(fixedLens=dict(focalEquivMm=[19,19],aperture=[2.8,2.8]))),
 cam("powershot-sx740-hs","PowerShot SX740 HS","compact","fixed","1_2_3_inch",20.3,10,None,"4K",30,False,False,False,False,False,False,"none",False,299,[110.1,63.8,39.9],"1x SD",399,None,"beginner",["travel","everyday","zoom"],K,K,None,
     dict(fixedLens=dict(focalEquivMm=[24,960],aperture=[3.3,6.9]))),
 cam("powershot-sx70-hs","PowerShot SX70 HS","compact","fixed","1_2_3_inch",20.3,10,None,"4K",30,False,False,False,False,True,True,"none",False,608,[127.1,90.9,116.6],"1x SD",549,None,"beginner",["wildlife","birds","zoom","travel"],K,K,None,
     dict(fixedLens=dict(focalEquivMm=[21,1365],aperture=[3.4,6.5]))),
]

def lens(id, name, mount, fmin, fmax, amin, amax, is_, weight, price, series, tags, src=K, macro=False, extra=None):
    d = dict(id=id, name=name, category="lens", mount=mount, focalMinMm=fmin, focalMaxMm=fmax,
             type="prime" if fmin == fmax else "zoom", maxApertureWide=amin, maxApertureTele=amax,
             imageStabilization=is_, weightG=weight, priceUSD=price, series=series, macro=macro,
             weatherSealed=(series == "L"), useTags=tags, source=src, priceSource=src, imageUrl=None)
    if extra: d.update(extra)
    return d

lenses = [
 # ---- RF primes ----
 lens("rf-16-f2.8","RF16mm F2.8 STM","RF",16,16,2.8,2.8,False,165,299,"standard",["landscape","astro","vlogging","architecture"]),
 lens("rf-20-f1.4-l-vcm","RF20mm F1.4 L VCM","RF",20,20,1.4,1.4,False,519,1699,"L",["astro","landscape","video","vlogging"]),
 lens("rf-24-f1.4-l-vcm","RF24mm F1.4 L VCM","RF",24,24,1.4,1.4,False,556,1399,"L",["astro","video","landscape","low_light"]),
 lens("rf-24-f1.8-macro","RF24mm F1.8 Macro IS STM","RF",24,24,1.8,1.8,True,270,599,"standard",["vlogging","street","astro","everyday"],macro=True),
 lens("rf-28-f2.8","RF28mm F2.8 STM","RF",28,28,2.8,2.8,False,120,299,"standard",["street","travel","everyday"]),
 lens("rf-35-f1.4-l-vcm","RF35mm F1.4 L VCM","RF",35,35,1.4,1.4,False,555,1399,"L",["street","events","video","low_light"]),
 lens("rf-35-f1.8-macro","RF35mm F1.8 Macro IS STM","RF",35,35,1.8,1.8,True,305,499,"standard",["street","everyday","low_light"],macro=True),
 lens("rf-45-f1.2","RF45mm F1.2 STM","RF",45,45,1.2,1.2,False,346,469,"standard",["portrait","low_light","everyday"]),
 lens("rf-50-f1.8","RF50mm F1.8 STM","RF",50,50,1.8,1.8,False,160,199,"standard",["portrait","low_light","everyday","beginner"]),
 lens("rf-50-f1.4-l-vcm","RF50mm F1.4 L VCM","RF",50,50,1.4,1.4,False,580,1399,"L",["portrait","video","low_light"]),
 lens("rf-50-f1.2-l","RF50mm F1.2 L USM","RF",50,50,1.2,1.2,False,950,2399,"L",["portrait","low_light","weddings"]),
 lens("rf-85-f2-macro","RF85mm F2 Macro IS STM","RF",85,85,2,2,True,500,599,"standard",["portrait"],macro=True),
 lens("rf-85-f1.4-l-vcm","RF85mm F1.4 L VCM","RF",85,85,1.4,1.4,False,650,1799,"L",["portrait","weddings","video"]),
 lens("rf-85-f1.2-l","RF85mm F1.2 L USM","RF",85,85,1.2,1.2,False,1195,2699,"L",["portrait","weddings"]),
 lens("rf-100-f2.8-l-macro","RF100mm F2.8 L Macro IS USM","RF",100,100,2.8,2.8,True,730,1399,"L",["macro","portrait"],macro=True),
 lens("rf-135-f1.8-l","RF135mm F1.8 L IS USM","RF",135,135,1.8,1.8,True,935,2099,"L",["portrait","indoor_sports","events"]),
 lens("rf-400-f2.8-l","RF400mm F2.8 L IS USM","RF",400,400,2.8,2.8,True,2890,11999,"L",["sports","wildlife"]),
 lens("rf-600-f4-l","RF600mm F4 L IS USM","RF",600,600,4,4,True,3090,12999,"L",["wildlife","birds","sports"]),
 lens("rf-600-f11","RF600mm F11 IS STM","RF",600,600,11,11,True,930,799,"standard",["wildlife","birds"]),
 lens("rf-800-f11","RF800mm F11 IS STM","RF",800,800,11,11,True,1260,999,"standard",["wildlife","birds"]),
 lens("rf-800-f5.6-l","RF800mm F5.6 L IS USM","RF",800,800,5.6,5.6,True,3140,16999,"L",["wildlife","birds"]),
 lens("rf-1200-f8-l","RF1200mm F8 L IS USM","RF",1200,1200,8,8,True,3340,19999,"L",["wildlife","birds"]),
 # ---- RF zooms ----
 lens("rf-10-20-f4-l","RF10-20mm F4 L IS STM","RF",10,20,4,4,True,570,2399,"L",["landscape","architecture","vlogging"]),
 lens("rf-14-35-f4-l","RF14-35mm F4 L IS USM","RF",14,35,4,4,True,540,1699,"L",["landscape","travel","architecture"]),
 lens("rf-15-35-f2.8-l","RF15-35mm F2.8 L IS USM","RF",15,35,2.8,2.8,True,840,2299,"L",["landscape","astro","events"]),
 lens("rf-15-30-f4.5","RF15-30mm F4.5-6.3 IS STM","RF",15,30,4.5,6.3,True,390,549,"standard",["landscape","vlogging","travel"]),
 lens("rf-16-28-f2.8","RF16-28mm F2.8 IS STM","RF",16,28,2.8,2.8,True,445,1099,"standard",["landscape","astro","vlogging"]),
 lens("rf-20-50-f4-l-pz","RF20-50mm F4 L IS USM PZ","RF",20,50,4,4,True,None,1399,"L",["video","vlogging","gimbal"],"press/2026",extra=dict(powerZoom=True)),
 lens("rf-24-50-f4.5","RF24-50mm F4.5-6.3 IS STM","RF",24,50,4.5,6.3,True,210,299,"standard",["everyday","travel","beginner"]),
 lens("rf-24-70-f2.8-l","RF24-70mm F2.8 L IS USM","RF",24,70,2.8,2.8,True,900,2399,"L",["weddings","events","everyday"]),
 lens("rf-28-70-f2.8","RF28-70mm F2.8 IS STM","RF",28,70,2.8,2.8,True,495,1099,"standard",["events","everyday","travel"]),
 lens("rf-28-70-f2-l","RF28-70mm F2 L USM","RF",28,70,2,2,False,1430,3099,"L",["weddings","events","low_light"]),
 lens("rf-24-105-f4-l","RF24-105mm F4 L IS USM","RF",24,105,4,4,True,700,1299,"L",["travel","everyday","events"]),
 lens("rf-24-105-f4-7.1","RF24-105mm F4-7.1 IS STM","RF",24,105,4,7.1,True,395,399,"standard",["travel","everyday","beginner"]),
 lens("rf-24-105-f2.8-l-z","RF24-105mm F2.8 L IS USM Z","RF",24,105,2.8,2.8,True,1330,2999,"L",["video","weddings","events"]),
 lens("rf-24-240","RF24-240mm F4-6.3 IS USM","RF",24,240,4,6.3,True,750,899,"standard",["travel","everyday"]),
 lens("rf-70-200-f2.8-l","RF70-200mm F2.8 L IS USM","RF",70,200,2.8,2.8,True,1070,2799,"L",["sports","portrait","weddings","indoor_sports"]),
 lens("rf-70-200-f2.8-l-z","RF70-200mm F2.8 L IS USM Z","RF",70,200,2.8,2.8,True,1115,3299,"L",["sports","portrait","weddings","video","indoor_sports"]),
 lens("rf-70-200-f4-l","RF70-200mm F4 L IS USM","RF",70,200,4,4,True,695,1599,"L",["travel","portrait","sports","landscape"]),
 lens("rf-75-300","RF75-300mm F4-5.6","RF",75,300,4,5.6,False,500,199,"standard",["beginner","sports","wildlife"]),
 lens("rf-100-400","RF100-400mm F5.6-8 IS USM","RF",100,400,5.6,8,True,635,649,"standard",["wildlife","birds","sports"]),
 lens("rf-100-500-l","RF100-500mm F4.5-7.1 L IS USM","RF",100,500,4.5,7.1,True,1370,2799,"L",["wildlife","birds","sports"]),
 lens("rf-100-300-f2.8-l","RF100-300mm F2.8 L IS USM","RF",100,300,2.8,2.8,True,2590,9499,"L",["sports","wildlife"]),
 lens("rf-200-800","RF200-800mm F6.3-9 IS USM","RF",200,800,6.3,9,True,2050,1899,"standard",["wildlife","birds"]),
 # ---- RF VR ----
 lens("rf-5.2-dual-fisheye","RF5.2mm F2.8 L Dual Fisheye","RF",5.2,5.2,2.8,2.8,False,350,1999,"L",["vr"],
      extra=dict(vr=True,compatibleBodiesOnly=["eos-r5","eos-r5-c","eos-r5-mark-ii","eos-r6-mark-ii","eos-r6-mark-iii","eos-r6-v","eos-r8-mark-ii"])),
 # ---- RF-S (APS-C) ----
 lens("rf-s-10-18","RF-S10-18mm F4.5-6.3 IS STM","RF-S",10,18,4.5,6.3,True,150,299,"standard",["landscape","vlogging","architecture"]),
 lens("rf-s-14-30-pz","RF-S14-30mm F4-6.3 IS STM PZ","RF-S",14,30,4,6.3,True,180,449,"standard",["vlogging","video"],extra=dict(powerZoom=True)),
 lens("rf-s-18-45","RF-S18-45mm F4.5-6.3 IS STM","RF-S",18,45,4.5,6.3,True,130,299,"standard",["everyday","beginner","travel"]),
 lens("rf-s-18-150","RF-S18-150mm F3.5-6.3 IS STM","RF-S",18,150,3.5,6.3,True,310,499,"standard",["travel","everyday"]),
 lens("rf-s-55-210","RF-S55-210mm F5-7.1 IS STM","RF-S",55,210,5,7.1,True,270,349,"standard",["sports","wildlife","beginner"]),
 lens("rf-s-3.9-dual-fisheye","RF-S3.9mm F3.5 STM Dual Fisheye","RF-S",3.9,3.9,3.5,3.5,False,290,1099,"standard",["vr"],
      extra=dict(vr=True,compatibleBodiesOnly=["eos-r7","eos-r50","eos-r50-v","eos-r10"])),
 # ---- EF / EF-S (DSLR-native, adaptable to RF) ----
 lens("ef-16-35-f4-l","EF16-35mm f/4L IS USM","EF",16,35,4,4,True,615,1099,"L",["landscape","architecture"]),
 lens("ef-24-70-f2.8-l-ii","EF24-70mm f/2.8L II USM","EF",24,70,2.8,2.8,False,805,1899,"L",["weddings","events"]),
 lens("ef-24-105-f4-l-ii","EF24-105mm f/4L IS II USM","EF",24,105,4,4,True,795,1099,"L",["travel","everyday"]),
 lens("ef-70-200-f2.8-l-iii","EF70-200mm f/2.8L IS III USM","EF",70,200,2.8,2.8,True,1480,2099,"L",["sports","portrait","weddings"]),
 lens("ef-100-400-l-ii","EF100-400mm f/4.5-5.6L IS II USM","EF",100,400,4.5,5.6,True,1570,2399,"L",["wildlife","birds","sports"]),
 lens("ef-50-f1.8","EF50mm f/1.8 STM","EF",50,50,1.8,1.8,False,160,125,"standard",["portrait","beginner","low_light"]),
 lens("ef-100-f2.8-l-macro","EF100mm f/2.8L Macro IS USM","EF",100,100,2.8,2.8,True,625,999,"L",["macro","portrait"],macro=True),

 # ---- seen on the live listing, not previously catalogued ----
 lens("rf-14-f1.4-l-vcm","RF14mm F1.4 L VCM","RF",14,14,1.4,1.4,False,None,2599,"L",["astro","landscape","architecture","video"]),
 lens("rf-7-14-fisheye-l","RF7-14mm F2.8-3.5 L Fisheye STM","RF",7,14,2.8,3.5,False,None,1899,"L",["landscape","creative","action"],extra=dict(fisheye=True)),
 lens("rf-s-7.8-dual","RF-S7.8mm F4 STM DUAL","RF-S",7.8,7.8,4,4,False,None,409.99,"standard",["vr","spatial_video"],
      extra=dict(vr=True,stereo=True,compatibleBodiesOnly=["eos-r7","eos-r50","eos-r50-v","eos-r10"])),
 lens("ef-16-35-f2.8-l-iii","EF16-35mm f/2.8L III USM","EF",16,35,2.8,2.8,False,790,2499,"L",["landscape","astro","architecture","events"]),
 lens("ef-11-24-f4-l","EF11-24mm f/4L USM","EF",11,24,4,4,False,1180,1999,"L",["landscape","architecture"]),
 lens("ef-s-10-22","EF-S10-22mm f/3.5-4.5 USM","EF-S",10,22,3.5,4.5,False,385,279.99,"standard",["landscape","architecture","travel"]),
 lens("ts-e-17-f4-l","TS-E17mm f/4L","EF",17,17,4,4,False,820,2599,"L",["architecture","landscape"],extra=dict(tiltShift=True,manualFocus=True)),
 lens("ts-e-24-f3.5-l-ii","TS-E24mm f/3.5L II","EF",24,24,3.5,3.5,False,780,2399,"L",["architecture","landscape"],extra=dict(tiltShift=True,manualFocus=True)),
 lens("ts-e-50-f2.8-l-macro","TS-E50mm f/2.8L Macro","EF",50,50,2.8,2.8,False,945,2599,"L",["product","macro","architecture"],extra=dict(tiltShift=True,manualFocus=True,macro=True)),
 lens("ts-e-90-f2.8-l-macro","TS-E90mm f/2.8L Macro","EF",90,90,2.8,2.8,False,915,2599,"L",["product","macro","portrait"],extra=dict(tiltShift=True,manualFocus=True,macro=True)),
 lens("ts-e-135-f4-l-macro","TS-E135mm f/4L Macro","EF",135,135,4,4,False,1110,2199,"L",["product","macro"],extra=dict(tiltShift=True,manualFocus=True,macro=True)),
 lens("ef-50-f1.2-l","EF50mm f/1.2L USM","EF",50,50,1.2,1.2,False,545,1349,"L",["portrait","low_light","weddings"]),
 lens("ef-35-f1.4-l-ii","EF35mm f/1.4L II USM","EF",35,35,1.4,1.4,False,760,1699,"L",["street","events","low_light"]),
 lens("ef-85-f1.4-l-is","EF85mm f/1.4L IS USM","EF",85,85,1.4,1.4,True,950,1749,"L",["portrait","weddings"]),
 lens("ef-70-200-f4-l-ii","EF70-200mm f/4L IS II USM","EF",70,200,4,4,True,780,1649,"L",["travel","portrait","sports"]),
 lens("ef-70-300-is-ii","EF70-300mm f/4-5.6 IS II USM","EF",70,300,4,5.6,True,710,689.99,"standard",["sports","wildlife","travel"]),
 lens("ef-400-f2.8-l-iii","EF400mm f/2.8L IS III USM","EF",400,400,2.8,2.8,True,2840,13399,"L",["sports","wildlife"]),
 lens("ef-600-f4-l-iii","EF600mm f/4L IS III USM","EF",600,600,4,4,True,3050,14449,"L",["wildlife","birds","sports"]),
 lens("ef-s-10-18","EF-S10-18mm f/4.5-5.6 IS STM","EF-S",10,18,4.5,5.6,True,240,279,"standard",["landscape","vlogging"]),
 lens("ef-s-18-55-is-ii","EF-S18-55mm f/3.5-5.6 IS II","EF-S",18,55,3.5,5.6,True,200,None,"standard",["beginner","everyday"]),
 lens("ef-75-300-iii","EF75-300mm f/4-5.6 III","EF",75,300,4,5.6,False,480,239.99,"standard",["beginner","sports","wildlife"]),
 lens("ef-s-24-f2.8","EF-S24mm f/2.8 STM","EF-S",24,24,2.8,2.8,False,125,149,"standard",["street","everyday"]),
 lens("ef-s-55-250","EF-S55-250mm f/4-5.6 IS STM","EF-S",55,250,4,5.6,True,375,299,"standard",["sports","wildlife","beginner"]),
]

kits = [
 dict(id="kit-eos-r8-mark-ii-rf24-50",name="EOS R8 Mark II RF24-50mm F4.5-6.3 IS STM Lens Kit",bodyId="eos-r8-mark-ii",lensIds=["rf-24-50-f4.5"],priceUSD=2099,regularPriceUSD=None,url=P+"eos-r8-mark-ii-rf24-50mm-f4-5-6-3-is-stm-lens-kit"),
 dict(id="kit-eos-r6-v-rf20-50-pz",name="EOS R6 V RF20-50mm F4 L IS USM PZ Lens Kit",bodyId="eos-r6-v",lensIds=["rf-20-50-f4-l-pz"],priceUSD=3699,regularPriceUSD=None,url=P+"eos-r6-v-rf20-50mm-f4-l-is-usm-pz-lens-kit"),
 dict(id="kit-eos-r50-v-creator",name="EOS R50 V Video Creator Kit",bodyId="eos-r50-v",lensIds=["rf-s-14-30-pz"],priceUSD=1049,regularPriceUSD=1199,url=P+"eos-r50-v-video-creator-kit",notes="Creator kit also includes accessories; lens assumed from launch kit, verify."),
 dict(id="kit-eos-r6-mark-iii-rf24-105-stm",name="EOS R6 Mark III RF24-105mm F4-7.1 IS STM Lens Kit",bodyId="eos-r6-mark-iii",lensIds=["rf-24-105-f4-7.1"],priceUSD=3149,regularPriceUSD=None,url=P+"eos-r6-mark-iii-rf24-105mm-f4-7-1-is-stm-lens-kit"),
 dict(id="kit-eos-r6-mark-iii-rf24-105-l",name="EOS R6 Mark III RF24-105mm F4 L IS USM Lens Kit",bodyId="eos-r6-mark-iii",lensIds=["rf-24-105-f4-l"],priceUSD=4049,regularPriceUSD=None,url=P+"eos-r6-mark-iii-rf24-105mm-f4-l-is-usm-lens-kit"),
 dict(id="kit-eos-5d-mark-iv-ef24-105-l",name="EOS 5D Mark IV EF 24-105mm f/4L IS II USM Lens Kit",bodyId="eos-5d-mark-iv",lensIds=["ef-24-105-f4-l-ii"],priceUSD=3199,regularPriceUSD=3699,url=P+"eos-5d-mark-iv-ef-24-105mm-f-4l-is-ii-usm-lens-kit"),
 dict(id="kit-eos-rebel-t7-18-55",name="EOS Rebel T7 EF-S 18-55mm IS II Kit",bodyId="eos-rebel-t7",lensIds=["ef-s-18-55-is-ii"],priceUSD=499.99,regularPriceUSD=579.99,url=P+"eos-rebel-t7-ef-s-18-55mm-f-3-5-5-6-is-ii"),
 dict(id="kit-eos-rebel-t7-double-zoom",name="EOS Rebel T7 Double Zoom Lens Kit",bodyId="eos-rebel-t7",lensIds=["ef-s-18-55-is-ii","ef-75-300-iii"],priceUSD=619.99,regularPriceUSD=699.99,url=P+"eos-rebel-t7-double-zoom-lens-kit"),
]
for k in kits: k.update(category="kit", source=SITE)

null = None
VARIANTS = {"eos-r6-v": [["EOS R6 V Body with Stop Motion Animation Firmware", 2599, null, "eos-r6-v-body-with-stop-motion-animation-firmware", "backorder"]], "eos-r6-mark-iii": [["EOS R6 Mark III Body with Stop Motion Animation Firmware", 2899, null, "eos-r6-mark-iii-body-with-stop-motion-animation-firmware", "backorder"]], "eos-r6-mark-ii": [["EOS R6 Mark II Body with Stop Motion Animation Firmware", 2099, 2399, "eos-r6-mark-ii-body-with-stop-motion-animation-firmware", "out"], ["EOS R6 Mark II with Cropping Guide Firmware", 2119, 2419, "eos-r6-mark-ii-with-cropping-guide-firmware", "in"]], "eos-r7": [["EOS R7 Body with Cropping Guide Firmware", 1769, null, "eos-r7-body-with-cropping-guide-firmware", "out"]], "eos-r8": [["EOS R8 with Cropping Guide Firmware", 1519, 1769, "eos-r8-with-cropping-guide-firmware", "in"]], "eos-r50": [["EOS R50 Body with Cropping Guide Firmware", 849.99, 899.99, "eos-r50-body-with-cropping-guide-firmware", "in"]], "eos-r10": [["EOS R10 Body with Cropping Guide Firmware", 1219, null, "eos-r10-body-with-cropping-guide-firmware", "out"]], "eos-rp": [["EOS RP Body with Stop Motion Animation Firmware", 1249, null, "eos-rp-body-with-stop-motion-animation-firmware", "out"]]}
STOCK = {"eos-r8-mark-ii": "in", "eos-r6-v": "backorder", "eos-r6-mark-iii": "backorder", "eos-r1": "in", "eos-r3": "in", "eos-r5-mark-ii": "in", "eos-r5": "in", "eos-r5-c": "in", "eos-r6-mark-ii": "in", "eos-r7": "backorder", "eos-r8": "in", "eos-r50-v": "in", "eos-r50": "in", "eos-r10": "in", "eos-rp": "in", "eos-5d-mark-iv": "in"}
for c in cameras:
    if c["id"] in VARIANTS:
        c.setdefault("variants", [])
        c["variants"] += [dict(name=n, priceUSD=p, regularPriceUSD=r, url=P+u, stock=st) for n,p,r,u,st in VARIANTS[c["id"]]]
    if c["id"] in STOCK: c["stock"] = STOCK[c["id"]]
    c["verifiedOnSite"] = c["priceSource"] == SITE

assert len({c["id"] for c in cameras}) == len(cameras)
LIVE_MAP = {
 "rf20-50mm-f4-l-is-usm-pz-lens":"rf-20-50-f4-l-pz","rf14mm-f1-4-l-vcm":"rf-14-f1.4-l-vcm","rf7-14mm-f2-8-3-5-l-fisheye-stm":"rf-7-14-fisheye-l",
 "rf45mm-f1-2-stm":"rf-45-f1.2","rf85mm-f1-4-l-vcm":"rf-85-f1.4-l-vcm","rf-s10-18mm-f4-5-6-3-is-stm":"rf-s-10-18","rf10-20mm-f4-l-is-stm":"rf-10-20-f4-l",
 "rf14-35mm-f4-l-is-usm":"rf-14-35-f4-l","rf-s14-30mm-f4-6-3-is-stm-pz":"rf-s-14-30-pz","rf15-35mm-f2-8-l-is-usm":"rf-15-35-f2.8-l",
 "rf15-30mm-f4-5-6-3-is-stm":"rf-15-30-f4.5","rf16mm-f2-8-stm":"rf-16-f2.8","rf16-28mm-f2-8-is-stm-lens":"rf-16-28-f2.8","rf-s18-45mm-f4-5-6-3-is-stm":"rf-s-18-45",
 "rf-s18-150mm-f3-5-6-3-is-stm":"rf-s-18-150","rf20mm-f-1-4-l-vcm":"rf-20-f1.4-l-vcm","rf24mm-f1-4-l-vcm":"rf-24-f1.4-l-vcm","rf24mm-f1-8-macro-is-stm":"rf-24-f1.8-macro",
 "rf24-50mm-f4-5-6-3-is-stm":"rf-24-50-f4.5","rf24-70mm-f2-8l-is-usm":"rf-24-70-f2.8-l","rf24-105mm-f2-8-l-is-usm-z":"rf-24-105-f2.8-l-z","rf24-105mm-f4-7-1-is-stm":"rf-24-105-f4-7.1",
 "rf24-105mm-f4-l-is-usm":"rf-24-105-f4-l","rf24-240mm-f4-6-3-is-usm":"rf-24-240","rf28mm-f2-8-stm":"rf-28-f2.8","rf28-70mm-f2-8-is-stm":"rf-28-70-f2.8",
 "rf28-70mm-f2-l-usm":"rf-28-70-f2-l","rf35mm-f1-4-l-vcm":"rf-35-f1.4-l-vcm","rf35mm-f1-8-macro-is-stm":"rf-35-f1.8-macro","rf50mm-f1-2-l-usm":"rf-50-f1.2-l",
 "rf50mm-f1-4-l-vcm":"rf-50-f1.4-l-vcm","rf50mm-f1-8-stm":"rf-50-f1.8","rf-s55-210mm-f5-7-1-is-stm":"rf-s-55-210","rf70-200mm-f4-l-is-usm":"rf-70-200-f4-l",
 "rf70-200mm-f2-8-l-is-usm":"rf-70-200-f2.8-l","rf70-200mm-f2-8-l-is-usm-z":"rf-70-200-f2.8-l-z",
 "ef-50mm-f-1-2l-usm":"ef-50-f1.2-l","ef-50mm-f-1-8-stm":"ef-50-f1.8","ef-s-55-250mm-f-4-5-6-is-stm":"ef-s-55-250","ef-70-200mm-f-2-8l-is-iii-usm":"ef-70-200-f2.8-l-iii",
 "ef-70-200mm-f-4l-is-ii-usm":"ef-70-200-f4-l-ii","ef-70-300mm-f-4-5-6-is-ii-usm":"ef-70-300-is-ii","ef-75-300mm-f-4-5-6-iii":"ef-75-300-iii",
 "ef-85mm-f-1-4l-is-usm":"ef-85-f1.4-l-is","ef-600mm-f-4l-is-iii-usm":"ef-600-f4-l-iii","ef-400mm-f-2-8l-is-iii-usm":"ef-400-f2.8-l-iii",
 "ef-35mm-f-1-4l-ii-usm":"ef-35-f1.4-l-ii",
 "rf600mm-f4-l-is-usm":"rf-600-f4-l","rf800mm-f11-is-stm":"rf-800-f11","rf800mm-f5-6-l-is-usm-lens":"rf-800-f5.6-l",
 "rf1200mm-f8-l-is-usm-lens":"rf-1200-f8-l","rf-s3-9mm-f3-5-stm-dual-fisheye":"rf-s-3.9-dual-fisheye",
 "rf5-2mm-f2-8-l-dual-fisheye":"rf-5.2-dual-fisheye","rf-s7-8mm-f4-stm-dual":"rf-s-7.8-dual",
 "rf75-300mm-f4-5-6":"rf-75-300",
 "ef-24-105mm-f-4l-is-ii-usm":"ef-24-105-f4-l-ii","ef-16-35mm-f-4l-is-usm":"ef-16-35-f4-l","ef-16-35mm-f-2-8l-iii-usm":"ef-16-35-f2.8-l-iii",
 "ef-11-24mm-f-4l-usm":"ef-11-24-f4-l","ef-100mm-f-2-8l-macro-is-usm":"ef-100-f2.8-l-macro","ef-100-400mm-f-4-5-5-6l-is-ii-usm":"ef-100-400-l-ii",
 "ef-s-24mm-f-2-8-stm":"ef-s-24-f2.8","ef-s-18-55mm-f-3-5-5-6-is-ii":"ef-s-18-55-is-ii","ef-s-10-18mm-f-4-5-5-6-is-stm":"ef-s-10-18",
 "ef-s-10-22mm-f-3-5-4-5-usm":"ef-s-10-22","ts-e-17mm-f-4l":"ts-e-17-f4-l","ts-e-24mm-f-3-5l-ii":"ts-e-24-f3.5-l-ii",
 "ts-e-50mm-f-2-8l-macro":"ts-e-50-f2.8-l-macro","ts-e-90mm-f-2-8l-macro":"ts-e-90-f2.8-l-macro","ts-e-135mm-f-4l-macro":"ts-e-135-f4-l-macro","rf85mm-f1-2-l-usm":"rf-85-f1.2-l","rf85mm-f1-2-l-usm-ds":"VARIANT:rf-85-f1.2-l",
 "rf85mm-f2-macro-is-stm":"rf-85-f2-macro","rf100mm-f2-8-l-macro-is-usm":"rf-100-f2.8-l-macro","rf100-300mm-f2-8-l-is-usm":"rf-100-300-f2.8-l",
 "rf100-400mm-f5-6-8-is-usm":"rf-100-400","rf100-500mm-f4-5-7-1-l-is-usm":"rf-100-500-l","rf135mm-f1-8-l-is-usm":"rf-135-f1.8-l",
 "rf200-800mm-f6-3-9-is-usm":"rf-200-800","rf400mm-f2-8-l-is-usm":"rf-400-f2.8-l","rf600mm-f11-is-stm":"rf-600-f11","ef-24-70mm-f-2-8l-ii-usm":"ef-24-70-f2.8-l-ii"}
_live = json.load(open("data/live_lens_prices.json"))["items"]
_by_id = {l["id"]: l for l in lenses}
for it in _live:
    tgt = LIVE_MAP.get(it["url"], "")
    if tgt.startswith("VARIANT:"):
        base = _by_id[tgt.split(":",1)[1]]
        base.setdefault("variants", []).append(dict(name=it["name"], priceUSD=it["price"], regularPriceUSD=it.get("reg"),
            url=P+it["url"], stock=it.get("stock","in"), note="Defocus Smoothing coating for smoother bokeh; same optics"))
        continue
    l = _by_id.get(tgt)
    assert l, f"unmapped live lens {it['url']}"
    l.update(priceUSD=it["price"], regularPriceUSD=it.get("reg"), stock=it.get("stock","in"),
             priceSource=SITE, productUrl=P+it["url"], verifiedOnSite=True)
for l in lenses: l.setdefault("verifiedOnSite", False)

assert len({l["id"] for l in lenses}) == len(lenses)
meta = dict(generatedOn="2026-10-20",
            note="Records with source 'knowledge-unverified' must be checked against usa.canon.com before publishing. Firmware variants (Stop Motion, Cropping Guide) are folded into their base body.")
json.dump(dict(meta=meta, cameras=cameras), open("data/cameras.json","w"), indent=2)
json.dump(dict(meta=meta, lenses=lenses), open("data/lenses.json","w"), indent=2)
ids={l["id"] for l in lenses}|{c["id"] for c in cameras}
for k in kits: assert k["bodyId"] in ids and all(x in ids for x in k["lensIds"]), k["id"]
json.dump(dict(meta=meta, kits=kits), open("data/kits.json","w"), indent=2)
print(len(cameras), "cameras;", len(lenses), "lenses;", len(kits), "kits")
