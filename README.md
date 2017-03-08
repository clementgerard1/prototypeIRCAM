#Application Subway

> *Subway* is a prototype based on the [*Soundworks*](https://github.com/collective-soundworks/soundworks/) framework.

This prototype has been developed at Ircam in the team 'Sound Music Mouvement Interaction' during a training course.

This prototype use svg to create the application world : [*svg-edit*](https://svg-edit.github.io/svgedit/releases/svg-edit-2.8.1/svg-editor.html)

###Concept

The *player* can moving in a world where he is invited to discover sounds by following path or shape.



###Functioning

There is a drawing map designed with invisible rect and ellipse which create areas linked to differents sounds. When a player is in a shape, the sound is played.

There are paths and shapes (also designed in svg) which play sounds when the player follow the path. If the player follow the edge of the shape, sound is clearer.

###Installation

```sh
# to start the application
git clone https://github.com/clementgerard1/subway-soundworks.git
cd subway-soundworks
npm install
npm run transpile
npm run start
```



You can refer to the [*Soundworks Template*](https://github.com/collective-soundworks/soundworks-template/) and [*Xmm-lfo*](https://github.com/Ircam-RnD/xmm-lfo/) repositories to learn more about the structure of this project. 
