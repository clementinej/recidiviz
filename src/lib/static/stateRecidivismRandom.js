/*
 * Recidiviz - a platform for tracking granular recidivism metrics in real time
 * Copyright (C) 2018 Recidiviz, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * ============================================================================
*/

'use strict';

import * as $ from 'jquery';
import * as _ from 'lodash';

import Columns from './jquery.columns';

$.fn.columns = function(options) {
		var val = [];
		var args = Array.prototype.slice.call(arguments, 1);

		if (typeof options === 'string') {
				this.each(function() {

						var instance = $.data(this, 'columns');
						if (typeof instance !== 'undefined' && $.isFunction(instance[options])) {
								var methodVal = instance[options].apply(instance, args);
								if (methodVal !== undefined && methodVal !== instance) {
										val.push(methodVal);
								}
						} else {
								return $.error('No such method "' + options + '" for Columns');
						}
				});

		} else {
				this.each(function() {
						if (!$.data(this, 'columns')) {
								$.data(this, 'columns', new Columns(this, options));
						}
				});
		}

		if (val.length === 0) {
				return this.data('columns');
		} else if (val.length === 1) {
				return val[0];
		} else {
				return val;
		}
};

export default function stateSelect (form) {
	var cloneObj = $("#state-prisons-table").clone();
  var selectedState = form.fields[0].elOriginal.value;

  $.getJSON( "../../../data/wikipedia/state_prisons.json", function( prisonsByState ) {
      var statePrisonsWithRandomRates = prisonsByState.map(function (state) {
        var publicPrisons = state['public'];
        var privatePrisons = state['private'];

        var publicPrisonsWithRandomRates = [];
        if (publicPrisons != null) {
            publicPrisonsWithRandomRates = publicPrisons.map(function (prison) {
                return {
                    "Prison Name": prison,
                    "Type": "public",
                    "Recidivism Rate": (Math.random() * 100).toFixed(2)
                }
            });
        }

        var privatePrisonsWithRandomRates = [];
        if (privatePrisons != null) {
            privatePrisonsWithRandomRates = privatePrisons.map(function (prison) {
                return {
                    "Prison Name": prison,
                    "Type": "private",
                    "Recidivism Rate": (Math.random() * 100).toFixed(2)
                }
            });
        }

        var prisonsWithRandomRates = publicPrisonsWithRandomRates.concat(privatePrisonsWithRandomRates);
        prisonsWithRandomRates.sort(function (left, right) {
            return right['Recidivism Rate'] - left['Recidivism Rate'];
        });
        prisonsWithRandomRates = prisonsWithRandomRates.map(function (prison) {
            var rate = prison["Recidivism Rate"];
            return {
                "Prison Name": prison["Prison Name"],
                "Type": prison["Type"],
                "Recidivism Rate": (rate < 10 ? '0' : '') + rate + "%"
            };
        });

        return {
            "state": state['state'],
            "prisons": prisonsWithRandomRates
        };
      });

      var prisonsByStateWithRandomRates = _.keyBy(statePrisonsWithRandomRates, entry => entry.state);

      $('div#state-prisons-table').replaceWith(cloneObj.clone());
      $('div#state-prisons-table').columns({ data : prisonsByStateWithRandomRates[selectedState]['prisons'] });
  });
};