import createElement from './vdom/createElement';
import render from './vdom/render';
import mount from './vdom/mount';
import diff from './vdom/diff';

const createVApp = count => createElement('div', {
    attrs: {
        id: 'app',
        dataCount: count,
    },
    children: [
        createElement('div', {
            attrs: {
                id: 'box',
                class: 'box'
            },
            children: [
                'LOREM IPSUM: ',
                String(count),
            ]
        })
    ]
});

let count = 0;
let vApp = createVApp(count);
const $app = render(vApp)
let $rootElement = mount($app, document.getElementById('app'))

setInterval(() => {
    count++;

    const vNewApp = createVApp(count);
    const patch = diff(vApp, vNewApp);

    $rootElement = patch($rootElement);
    vApp = vNewApp;
}, 1000);