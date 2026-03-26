document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.getElementById('cardGrid');
    const searchInput = document.getElementById('searchInput');
    const classFilter = document.getElementById('classFilter');

    // Filter Inputs
    const mwMin = document.getElementById('mwMin');
    const mwMax = document.getElementById('mwMax');
    const logpMin = document.getElementById('logpMin');
    const logpMax = document.getElementById('logpMax');
    const tpsaMin = document.getElementById('tpsaMin');
    const tpsaMax = document.getElementById('tpsaMax');
    const resetBtn = document.getElementById('resetFilters');

    // compoundsData is now a global variable loaded from data.js
    let allCompounds = (typeof compoundsData !== 'undefined') ? compoundsData : [];

    if (allCompounds.length === 0) {
        console.error('No data found in compoundsData');
        cardGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #94a3b8;">Error: No data loaded. Please check data.js.</p>';
    } else {
        const uniqueClasses = [...new Set(allCompounds.map(c => c.class).filter(c => c && c !== 'Unclassified'))].sort();
        uniqueClasses.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            classFilter.appendChild(option);
        });

        renderCards(allCompounds);
    }

    // Unified Filter Function
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedClass = classFilter.value;

        // Parse numerical inputs
        const mw_min = parseFloat(mwMin.value) || 0;
        const mw_max = parseFloat(mwMax.value) || Infinity;
        const logp_min = parseFloat(logpMin.value) || -Infinity;
        const logp_max = parseFloat(logpMax.value) || Infinity;
        const tpsa_min = parseFloat(tpsaMin.value) || 0;
        const tpsa_max = parseFloat(tpsaMax.value) || Infinity;

        const filteredCompounds = allCompounds.filter(compound => {
            // Text Search
            const textMatch = (
                compound.name.toLowerCase().includes(searchTerm) ||
                compound.class.toLowerCase().includes(searchTerm) ||
                compound.molecular_formula.toLowerCase().includes(searchTerm)
            );

            // Class Filter
            const classMatch = !selectedClass || compound.class === selectedClass;

            // Numerical Filters
            const mwMatch = compound.mw >= mw_min && compound.mw <= mw_max;
            const logpMatch = compound.logp >= logp_min && compound.logp <= logp_max;
            const tpsaMatch = compound.tpsa >= tpsa_min && compound.tpsa <= tpsa_max;

            return textMatch && classMatch && mwMatch && logpMatch && tpsaMatch;
        });

        renderCards(filteredCompounds);
    }

    // Event Listeners for all inputs
    const inputs = [searchInput, classFilter, mwMin, mwMax, logpMin, logpMax, tpsaMin, tpsaMax];
    inputs.forEach(input => {
        input.addEventListener('input', filterData);
    });

    // Reset Button
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        classFilter.value = '';
        mwMin.value = '';
        mwMax.value = '';
        logpMin.value = '';
        logpMax.value = '';
        tpsaMin.value = '';
        tpsaMax.value = '';
        renderCards(allCompounds);
    });

    function renderCards(compounds) {
        cardGrid.innerHTML = ''; // Clear existing cards

        if (compounds.length === 0) {
            cardGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #94a3b8;">No compounds found matching your search.</p>';
            return;
        }

        compounds.forEach(compound => {
            const card = document.createElement('div');
            card.className = 'card';

            // Fallback for long names
            const displayName = compound.name.length > 25 ? compound.name.substring(0, 22) + '...' : compound.name;

            let refHtml = compound.referencias || 'N/A';
            if (refHtml !== 'N/A') {
                const trimmedRef = refHtml.trim();
                if (trimmedRef.startsWith('http')) {
                    refHtml = `<a href="${trimmedRef}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); text-decoration: none; font-weight: 500;">Article Link ↗</a>`;
                } else if (trimmedRef.startsWith('10.')) {
                    refHtml = `<a href="https://doi.org/${trimmedRef}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); text-decoration: none; font-weight: 500;">DOI ↗</a>`;
                }
            }

            card.innerHTML = `
                <div class="card-image" style="position: relative;">
                    ${compound.class && compound.class !== 'Unclassified' ? `<span class="tag" style="position: absolute; top: 1rem; left: 1rem; margin: 0; background-color: rgba(56, 189, 248, 0.9); color: white; padding: 0.25rem 0.5rem; text-shadow: 0 1px 2px rgba(0,0,0,0.1); border-radius: 0.25rem; z-index: 10;">${compound.class}</span>` : ''}
                    <img src="assets/images/${compound.image}" alt="${compound.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+'">
                </div>
                <div class="card-content">
                    <h2 class="card-title" title="${compound.name}">${displayName}</h2>
                    
                    <div class="card-property">
                        <span class="label">ID</span>
                        <span>${compound.id}</span>
                    </div>
                    
                    <div class="card-property">
                        <span class="label">Molecular Formula</span>
                        <span>${compound.molecular_formula}</span>
                    </div>

                    <div class="card-property">
                        <span class="label">SMILES</span>
                        <div style="display: flex; align-items: flex-start; gap: 0.5rem; justify-content: flex-end;">
                            <span class="smiles-text" title="${compound.smiles}" style="margin: 0;">${compound.smiles}</span>
                            <button class="copy-btn" onclick="navigator.clipboard.writeText('${compound.smiles}').then(() => {let tmp=this.innerHTML; this.innerHTML='Copied!'; setTimeout(()=>this.innerHTML=tmp, 1500)})" style="background: none; border: 1px solid var(--card-border); border-radius: 4px; padding: 2px 6px; cursor: pointer; color: var(--accent-color); font-size: 0.7rem; transition: background 0.3s; margin-top: 2px;">Copy</button>
                        </div>
                    </div>

                    <div class="card-property" style="margin-top: 0.5rem; align-items: flex-start;">
                        <span class="label">References</span>
                        <span style="font-size: 0.75rem; color: #475569; text-align: right; word-break: break-word; max-width: 70%;" title="${compound.referencias}">${refHtml}</span>
                    </div>

                    <div class="card-property" style="margin-top: 0.5rem;">
                        <span class="label" title="Lipinski's Rule of 5 for Drug-likeness">Drug-Likeness</span>
                        <span style="font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; ${compound.lipinski_pass ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'}">
                            ${compound.lipinski_pass ? 'Ro5 Compliant' : `Violates Ro5 (${compound.ro5_violations})`}
                        </span>
                    </div>

                    <div class="card-stats" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem; margin: 1rem 0; text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 0.5rem;">
                        <div class="stat-item" title="Molecular Weight">
                            <span class="label" style="display:block; font-size: 0.65rem;">MW</span>
                            <span class="value" style="font-weight: 600; color: #38bdf8; font-size: 0.8rem;">${compound.mw}</span>
                        </div>
                        <div class="stat-item" title="Lipophilicity">
                            <span class="label" style="display:block; font-size: 0.65rem;">Log<i>P</i></span>
                            <span class="value" style="font-weight: 600; color: #818cf8; font-size: 0.8rem;">${compound.logp}</span>
                        </div>
                        <div class="stat-item" title="Topological Polar Surface Area">
                            <span class="label" style="display:block; font-size: 0.65rem;">TPSA</span>
                            <span class="value" style="font-weight: 600; color: #38bdf8; font-size: 0.8rem;">${compound.tpsa}</span>
                        </div>
                        <div class="stat-item" title="H-Bond Donors">
                            <span class="label" style="display:block; font-size: 0.65rem;">HBD</span>
                            <span class="value" style="font-weight: 600; color: #34d399; font-size: 0.8rem;">${compound.hbd}</span>
                        </div>
                        <div class="stat-item" title="H-Bond Acceptors">
                            <span class="label" style="display:block; font-size: 0.65rem;">HBA</span>
                            <span class="value" style="font-weight: 600; color: #34d399; font-size: 0.8rem;">${compound.hba}</span>
                        </div>
                    </div>

                    <div class="card-actions" style="margin-top: 1rem; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 1rem;">
                        <a href="assets/sdf/${compound.sdf}" download="${compound.sdf}" class="download-btn" onclick="event.stopPropagation();">
                            Download SDF
                        </a>
                    </div>
                </div>
            `;

            // Add click interaction
            card.addEventListener('click', () => {
                console.log(`Clicked on ${compound.name}`);
            });

            cardGrid.appendChild(card);
        });
    }

    // Analytics Dashboard
    const analyticsBtn = document.getElementById('analyticsBtn');
    const analyticsModal = document.getElementById('analyticsModal');
    const closeAnalytics = document.getElementById('closeAnalytics');
    let charts = {};

    analyticsBtn.addEventListener('click', () => {
        analyticsModal.style.display = 'block';
        generateCharts();
    });

    closeAnalytics.addEventListener('click', () => {
        analyticsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === analyticsModal) {
            analyticsModal.style.display = 'none';
        }
        if (event.target === citeUsModal) {
            citeUsModal.style.display = 'none';
        }
    });

    // Cite Us Modal
    const citeUsBtn = document.getElementById('citeUsBtn');
    const citeUsModal = document.getElementById('citeUsModal');
    const closeCiteUs = document.getElementById('closeCiteUs');

    if (citeUsBtn && citeUsModal && closeCiteUs) {
        citeUsBtn.addEventListener('click', () => {
            citeUsModal.style.display = 'block';
        });

        closeCiteUs.addEventListener('click', () => {
            citeUsModal.style.display = 'none';
        });
    }

    function generateCharts() {
        if (!allCompounds.length) return;

        // Helper to destroy old charts
        const destroyChart = (id) => {
            if (charts[id]) {
                charts[id].destroy();
            }
        };

        // 1. Class Distribution
        const classCounts = {};
        allCompounds.forEach(c => {
            classCounts[c.class] = (classCounts[c.class] || 0) + 1;
        });

        destroyChart('classChart');
        charts['classChart'] = new Chart(document.getElementById('classChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(classCounts),
                datasets: [{
                    data: Object.values(classCounts),
                    backgroundColor: [
                        '#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185', '#2dd4bf'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right', labels: { color: '#64748b' } }
                }
            }
        });

        // Helper for Histogram Data
        const getHistogramData = (property, binSize) => {
            const values = allCompounds.map(c => c[property]);
            const min = Math.floor(Math.min(...values) / binSize) * binSize;
            const max = Math.ceil(Math.max(...values) / binSize) * binSize;
            const bins = {};

            // Initialize bins
            for (let i = min; i < max; i += binSize) {
                bins[i] = 0;
            }

            values.forEach(v => {
                const bin = Math.floor(v / binSize) * binSize;
                if (bins[bin] !== undefined) bins[bin]++;
            });

            return {
                labels: Object.keys(bins).map(k => `${k}-${parseInt(k) + binSize}`),
                data: Object.values(bins)
            };
        };

        // 2. MW Distribution
        const mwData = getHistogramData('mw', 50);
        destroyChart('mwChart');
        charts['mwChart'] = new Chart(document.getElementById('mwChart'), {
            type: 'bar',
            data: {
                labels: mwData.labels,
                datasets: [{
                    label: 'Count',
                    data: mwData.data,
                    backgroundColor: '#38bdf8',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 3. LogP Distribution
        const logpData = getHistogramData('logp', 1);
        destroyChart('logpChart');
        charts['logpChart'] = new Chart(document.getElementById('logpChart'), {
            type: 'bar',
            data: {
                labels: logpData.labels,
                datasets: [{
                    label: 'Count',
                    data: logpData.data,
                    backgroundColor: '#818cf8',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // 4. TPSA Distribution
        const tpsaData = getHistogramData('tpsa', 20);
        destroyChart('tpsaChart');
        charts['tpsaChart'] = new Chart(document.getElementById('tpsaChart'), {
            type: 'bar',
            data: {
                labels: tpsaData.labels,
                datasets: [{
                    label: 'Count',
                    data: tpsaData.data,
                    backgroundColor: '#34d399',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.2)' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
});
