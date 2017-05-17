import createSpaceButton from './ui/create-space-button.vue';
import UILaunchButton from './ui/ui-launch-button.vue';
import spaceUI from './ui/space-ui.vue';
import styles from './styleguide/styles.scss';

// Selector Buttons
window.kiln.selectorButtons.createSpaceButton = createSpaceButton;
window.kiln.selectorButtons.UILaunchButton = UILaunchButton;

// Register Kiln Panes
window.kiln.panes['spaces-ui'] = spaceUI;
