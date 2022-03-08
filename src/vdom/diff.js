import render from './render';

const zip = (xs, ys) => {
    const zipped = [];
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]]);
    }
    return zipped;
};

const diffAttrs = (oldAttrs, newAttrs) => {
    const patches = [];

    for (const [attrKeys, attrValues] of Object.entries(newAttrs)) {
        patches.push($node => {
            $node.setAttribute(attrKeys, attrValues);
            return $node;
        })
    }

    for (const keys in oldAttrs) {
        if (!(keys in newAttrs)) {
            patches.push($node => {
                $node.removeAttribute(k);
                return $node
            })
        }
    }

    return $node => {
        for (const patch of patches) {
            patch($node)
        }
        return $node;
    }
}

const diffChildren = (oldVChildren, newVChildren) => {
    const childPatches = [];
    oldVChildren.forEach((oldVChildren, index) => {
        childPatches.push(diff(oldVChildren, newVChildren[index]));
    })

    const additionalPatches = [];
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
        additionalPatches.push($node => {
            $node.appendChild(render(additionalVChild))
            return $node
        })
    }

    return $parent => {
        for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
            patch($child);
        }

        for (const patch of additionalPatches) {
            patch($parent);
        }

        return $parent;
    }

}

const diff = (oldVTree, newVTree) => {
    if (newVTree === undefined) {
        return $node => {
            $node.remove();
            return undefined
        }
    }

    const someOfTreesIsAString = typeof oldVTree === 'string' || typeof newVTree === 'string'

    if (someOfTreesIsAString) {
        if (oldVTree !== newVTree) {
            return $node => {
                const $newNode = render(newVTree);
                $node.replaceWith($newNode);
                return $newNode;
            }
        } else {
            return $node => $node;
        }
    }

    if (oldVTree.tagName !== newVTree.tagName) {
        return $node => {
            const $newNode = render(newVTree);
            $node.replaceWith($newNode);
            return $newNode;
        }
    }

    const patchAttrs = diffAttrs(oldVTree.attrs, newVTree.attrs);
    const patchChildren = diffChildren(oldVTree.children, newVTree.children)

    return $node => {
        patchAttrs($node);
        patchChildren($node);

        return $node;
    }
}

export default diff;