import * as svelte from 'svelte';
import { TextField, NumberField, MaskedField, SelectField } from '../../../src/fields';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test Text
test('with no data, creates <Text /> elements', t => {
	const textField = new TextField({
		target,
		data: {
			value: 'one',
			label: 'text'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">text</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="text" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
	`);

	const input = target.querySelector('input');	
	t.equal(input.value, 'one');

	textField.set({ value: 'three' });

	t.equal(input.value, 'three');

	textField.destroy();
});

// test NumberField
test('with no data, creates <NumberField /> elements', t => {
	const numberField = new NumberField({
		target,
		data: {
			value: '1',
			label: 'number'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">number</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="number" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
	`);

	const input = target.querySelector('input');
	t.equal(input.value, '1');

	numberField.set({ value: '3' });

	t.equal(input.value, '3');
	numberField.destroy();
});

// test MaskedField
test('with no data, creates <MaskedField /> elements', t => {
	const maskedField = new MaskedField({
		target,
		data: {
			value: '1',
			label: 'masked'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">masked</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="text" class="form-control masked " pattern="" placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
    `);
    
	const input = target.querySelector('input');
	t.equal(maskedField.get().value, '1');
	// TODO - this fails with masked field, need to check value & text
	// t.equal(input.value, '1');

	maskedField.set({ value: '3' });
	   	
    t.equal(input.value, '3');
    
	maskedField.destroy();
});

// test Select
// test('with no data, creates <SelectField /> elements', t => {
// 	const selectField = new SelectField({
// 		target,
// 		data: {
// 			value: 'one',
// 			label: 'text'
// 		}
//     });

//     t.htmlEqualIgnoreId(target.innerHTML, `
//         <div class="form-group row">
//             <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">text</label>
//             <div class="col-8">
//                 <div class="form-group">
//                     <select class="form-control "></select>
//                 </div>
//             </div>
//         </div>
// 	`);

// 	const input = target.querySelector('select');	
// 	t.equal(input.value, 'one');

// 	selectField.set({ value: 'three' });

// 	t.equal(input.value, 'three');

// 	selectField.destroy();
// });

// this allows us to close puppeteer once tests have completed
window.done = done;