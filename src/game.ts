class SingleParticle {
    isAlive: boolean = false

    LIFE: number = 20
    size: number = 1
    countLife: number

    height: number = 2

    velocity: Vector3 = new Vector3(0, 0.01, 0) 
    acceleration: Vector3 = Vector3.Zero()

    entity: Entity
    transform: Transform
     
    constructor(shape: Shape, material: Material) { //INITIATE PARTICLE
        this.isAlive = false

        this.entity = new Entity()
        this.entity.addComponent(shape)
        this.entity.addComponent(material)

        this.entity.addComponent(new Transform({
            position: Vector3.Zero(),
            scale: Vector3.Zero()
        }))

        this.transform = this.entity.getComponent(Transform)
        engine.addEntity(this.entity)
    }
    act(position: Vector3) {    //ACTIVATE PARTICLE
        this.transform.position = position
        this.countLife = this.LIFE

        this.isAlive = true
        log("ACTIVATED", this.isAlive)
    }
    deact() {                   //DEACTIVATE PARTICLE
        this.isAlive = false 
        log("DEACTIVATED", this.isAlive)
    }
    simplePhysic() {
        this.transform.scale.setAll(this.size)
        this.transform.position.addInPlace(this.velocity)
        this.velocity.addInPlace(this.acceleration)
    }
    particleRule(dt: number) {
        //RULE
        this.countLife -= dt
        this.size = this.countLife / this.LIFE
        if (this.countLife < 0) {
            this.transform.scale.setAll(0)
            this.deact()
        }
    }
    update(dt: number) {
        if (this.isAlive) {
            this.simplePhysic()
            this.particleRule(dt)
        }
    }
}

//const testParticle = new SingleParticle(new BoxShape())
//testParticle.act(new Vector3(8, 0, 8))
//engine.addSystem(testParticle)


class ParticleSys {
    totalParticle: number
    interval: number
    countInterval: number
    particles: SingleParticle[] = []

    origin: Vector3
    area: number

    constructor(
        origin: Vector3,
        totalParticle: number,
        interval: number,
        shape: Shape,
        material: Material,
        area: number
    ) {
        this.totalParticle = totalParticle
        this.interval = interval
        this.countInterval = interval
        this.origin = origin
        this.createEntity(totalParticle, shape, material)
        this.area = area
    }
    createEntity(totalParticle, shape, material) {
        for (let i = 0; i < totalParticle; i++) {
            this.particles.push(new SingleParticle(shape, material))
            engine.addSystem(this.particles[i])
        }
    }
    getEntityIndex() {
        let i: number
        for (i = 0; i < this.particles.length; i++) {
            if (this.particles[i].isAlive === false) {
                return i
            }
        }

        return null
    }
    addSingleParticle() {
        const index = this.getEntityIndex() 
        if (index === null) return 

        //log(index)
        this.particles[index].act(this.origin.add(
            new Vector3(
                (Math.random() - Math.random()) * this.area,
                0,
                (Math.random() - Math.random()) * this.area
        )))
    }
    update(dt: number) {
        this.countInterval -= dt
        if (this.countInterval < 0) {
            this.countInterval = this.interval
            //log("TRYING ADD PARTICLE")
            this.addSingleParticle()
        }
    }
}

const initialColor1 = new Color3(1, 0.3, 0)
const finalColor1 = new Color3(1, 0, 0)
const material1 = new Material()
material1.albedoColor = Color3.Lerp(initialColor1, finalColor1, 1 / 5)
material1.emissiveColor = Color3.Lerp(initialColor1, finalColor1, 1 / 11)
material1.emissiveIntensity = 2

const initialColor2 = new Color3(0, 0.3, 1)
const finalColor2 = new Color3(0, 0, 1)
const material2 = new Material()
material2.albedoColor = Color3.Lerp(initialColor2, finalColor2, 1 / 5)
material2.emissiveColor = Color3.Lerp(initialColor2, finalColor2, 1 / 5)
material2.emissiveIntensity = 4
/*
const ps = new ParticleSys(new Vector3(2, 2, 2), 5, 3, new ConeShape(), material1)
engine.addSystem(ps)

const ps2 = new ParticleSys(new Vector3(8, 2, 8), 3, 3, new BoxShape(), material1)
engine.addSystem(ps2)

const ps3 = new ParticleSys(new Vector3(2, 2, 8), 10, 2, new BoxShape(), material2)
engine.addSystem(ps3)

const ps4 = new ParticleSys(new Vector3(8, 2, 2), 100, 0.25, new BoxShape(), material2)
engine.addSystem(ps4)
*/

class SingleParticleFloating extends SingleParticle {
    _SIZE: number
    speed: number = 0.5
    constructor(shape: Shape, material: Material) {
        super(shape, material)
        this.size = 0
        this._SIZE = 0.1
    }
    act(position: Vector3) {    //ACTIVATE PARTICLE
        this.transform.position = position
        this.countLife = this.LIFE
        this.transform.scale.setAll(0)
        this.isAlive = true

        log("ACTIVATED", this.isAlive)

        this.velocity = new Vector3(
            (Math.random() - Math.random()) * 0.01,
            (Math.random() - Math.random()) * 0.01,
            (Math.random() - Math.random()) * 0.01
        )
        this.acceleration = Vector3.Zero()
    } 
    simplePhysic() {
        this.transform.position.addInPlace(this.velocity.multiply(new Vector3(0.25, 0.25, 0.25)))
        this.velocity.addInPlace(this.acceleration)
    }
    particleRule(dt: number) {
        if (this.size < this._SIZE) {
            this.size += 0.25 * dt
            this.transform.scale.setAll(this.size)
        }
    }
    update(dt: number) {
        if (this.isAlive) {
            this.simplePhysic()
            this.particleRule(dt)
        }
    }
}

class ParticleSysFloating extends ParticleSys {
    constructor(
        origin: Vector3,
        totalParticle: number,
        interval: number,
        shape: Shape,
        material: Material,
        area: number
    ){
        super(origin, totalParticle, interval, shape, material, area)
    }
    createEntity(totalParticle, shape, material) {
        for (let i = 0; i < totalParticle; i++) {
            this.particles.push(new SingleParticleFloating(shape, material))
            engine.addSystem(this.particles[i])
        }
    }
    forceRandomAcc() {

    }
    sysRule() {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].velocity.x > 0.01) this.particles[i].acceleration.x = -0.0001
            if (this.particles[i].velocity.x < -0.01) this.particles[i].acceleration.x = 0.0001
            if (this.particles[i].velocity.y > 0.01) this.particles[i].acceleration.y = -0.0001
            if (this.particles[i].velocity.y < -0.01) this.particles[i].acceleration.y = 0.0001
            if (this.particles[i].velocity.z > 0.01) this.particles[i].acceleration.z = -0.0001
            if (this.particles[i].velocity.z < -0.01) this.particles[i].acceleration.z = 0.0001

            if (this.particles[i].transform.position.x > 15.5) {
                this.particles[i].acceleration.x = -0.0001
            }
            else if (this.particles[i].transform.position.x < 0.5) {
                this.particles[i].acceleration.x = 0.0001
            }
            else {
                if (this.particles[i].velocity.x < 0.01 && this.particles[i].velocity.x > -0.01) {
                    this.particles[i].acceleration.x = 0
                }
            }

            if (this.particles[i].transform.position.y > 7.5) {
                this.particles[i].acceleration.y = -0.0001
            }
            else if (this.particles[i].transform.position.y < 0.5) {
                this.particles[i].acceleration.y = 0.0001
            }
            else {
                if (this.particles[i].velocity.y < 0.01 && this.particles[i].velocity.y > -0.01) {
                    this.particles[i].acceleration.y = 0
                }
            }

            if (this.particles[i].transform.position.z > 15.5) {
                this.particles[i].acceleration.z = -0.0001
            }
            else if (this.particles[i].transform.position.z < 0.5) {
                this.particles[i].acceleration.z = 0.0001
            }
            else {
                if (this.particles[i].velocity.z < 0.01 && this.particles[i].velocity.z > -0.01) {
                    this.particles[i].acceleration.z = 0
                }
            }
        }
    }
    update(dt: number) {
        this.sysRule()
        if (this.countInterval >= 0)
            this.countInterval -= dt
        
        if (this.countInterval < 0) {
            //this.countInterval = this.interval
            //log("TRYING ADD PARTICLE")
            this.addSingleParticle()
        }
    }
}


const ps5 = new ParticleSysFloating(new Vector3(8, 4, 8), 25, 0, new BoxShape(), material2, 8)
engine.addSystem(ps5)
const ps8 = new ParticleSysFloating(new Vector3(8, 4, 8), 25, 0, new BoxShape(), material1, 8)
engine.addSystem(ps8) 
//const testExtParticle = new SingleParticle(new BoxShape(), material2)