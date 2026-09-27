import { makeNode } from '@/data/testFixtures';

import { nodesInBranch } from './branch';

describe('nodesInBranch', () => {
  it('keeps only the branch and sorts by column order', () => {
    const nodes = [
      makeNode({ id: 'c', chainOrder: 30 }),
      makeNode({ id: 'x', branch: 'legs', chainOrder: 10 }),
      makeNode({ id: 'a', chainOrder: 10 }),
    ];
    expect(nodesInBranch(nodes, 'v_pull').map((node) => node.id)).toEqual(['a', 'c']);
  });
});
