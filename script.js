class SeatAssignmentApp {
    constructor() {
        this.members = [];
        this.availableSeats = [];
        this.assignments = [];
        this.currentAssignmentIndex = 0;
        this.isAssigning = false;

        // Audio Context for sound effects
        this.audioContext = null;
        this.initAudioContext();

        // 座席定義
        this.allSeats = {
            '801': [
                {id: '801-S1', room: '801', label: 'S1', currentOccupant: '', available: true},
                {id: '801-S2', room: '801', label: 'S2', currentOccupant: '', available: true},
                {id: '801-A1', room: '801', label: 'A1', currentOccupant: 'free(deka monitor)', available: false},
                {id: '801-A2', room: '801', label: 'A2', currentOccupant: '', available: true},
                {id: '801-B1', room: '801', label: 'B1', currentOccupant: '', available: false},
                {id: '801-B2', room: '801', label: 'B2', currentOccupant: '', available: true},
                {id: '801-C1', room: '801', label: 'C1', currentOccupant: '本田', available: false},
                {id: '801-C2', room: '801', label: 'C2', currentOccupant: '', available: true},
                {id: '801-C3', room: '801', label: 'C3', currentOccupant: 'free(no monitor)', available: false},
                {id: '801-C4', room: '801', label: 'C4', currentOccupant: 'free(no monitor)', available: false},
                {id: '801-D1', room: '801', label: 'D1', currentOccupant: '', available: true},
                {id: '801-D2', room: '801', label: 'D2', currentOccupant: '', available: true},
                {id: '801-D3', room: '801', label: 'D3', currentOccupant: '', available: true},
            ],
            '804': [
                {id: '804-S1', room: '804', label: 'S1', currentOccupant: '', available: true},
                {id: '804-S2', room: '804', label: 'S2', currentOccupant: '', available: true},
                {id: '804-A1', room: '804', label: 'A1', currentOccupant: '', available: true},
                {id: '804-A2', room: '804', label: 'A2', currentOccupant: '', available: true},
                {id: '804-B1', room: '804', label: 'B1', currentOccupant: '', available: true},
                {id: '804-B2', room: '804', label: 'B2', currentOccupant: 'free(no monitor)', available: false},
                {id: '804-C1', room: '804', label: 'C1', currentOccupant: '', available: true},
                {id: '804-C2', room: '804', label: 'C2', currentOccupant: '', available: false},
                {id: '804-D1', room: '804', label: 'D1', currentOccupant: '', available: true},
                {id: '804-D2', room: '804', label: 'D2', currentOccupant: '', available: true}
            ]
        };
        
        this.initializeElements();
        this.bindEvents();
        this.initializeRoomDisplay();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    // ドラムロール音
    playDrumRoll() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 決定音（派手なファンファーレ風）
    playDecisionSound() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // メロディライン
        const melody = [
            {freq: 523.25, time: 0, duration: 0.15},     // C5
            {freq: 659.25, time: 0.15, duration: 0.15},  // E5
            {freq: 783.99, time: 0.3, duration: 0.3},    // G5
        ];

        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, now + note.time);

            gain.gain.setValueAtTime(0.3, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });

        // ハーモニー（3度上）
        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq * 1.26, now + note.time); // 3度上

            gain.gain.setValueAtTime(0.2, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });

        // ベース音
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();

        bass.connect(bassGain);
        bassGain.connect(this.audioContext.destination);

        bass.type = 'sine';
        bass.frequency.setValueAtTime(130.81, now); // C3

        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        bass.start(now);
        bass.stop(now + 0.6);
    }

    // 完了音（壮大なファンファーレ）
    playCompletionSound() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // トランペット風のファンファーレ
        const fanfare = [
            {freq: 523.25, time: 0},      // C5
            {freq: 659.25, time: 0.12},   // E5
            {freq: 783.99, time: 0.24},   // G5
            {freq: 1046.50, time: 0.36},  // C6
        ];

        fanfare.forEach((note, index) => {
            // メイントランペット
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(note.freq, now + note.time);
            gain1.gain.setValueAtTime(0.25, now + note.time);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.5);
            osc1.start(now + note.time);
            osc1.stop(now + note.time + 0.5);

            // ハーモニー（5度上）
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(note.freq * 1.5, now + note.time);
            gain2.gain.setValueAtTime(0.15, now + note.time);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.5);
            osc2.start(now + note.time);
            osc2.stop(now + note.time + 0.5);

            // ハーモニー（3度上）
            const osc3 = this.audioContext.createOscillator();
            const gain3 = this.audioContext.createGain();
            osc3.connect(gain3);
            gain3.connect(this.audioContext.destination);
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(note.freq * 1.26, now + note.time);
            gain3.gain.setValueAtTime(0.12, now + note.time);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.5);
            osc3.start(now + note.time);
            osc3.stop(now + note.time + 0.5);
        });

        // 壮大なベース
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bass.connect(bassGain);
        bassGain.connect(this.audioContext.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(130.81, now); // C3
        bassGain.gain.setValueAtTime(0.5, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        bass.start(now);
        bass.stop(now + 1.2);

        // シンバル風のノイズ
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(8000, now);

        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.start(now);
        noise.stop(now + 0.5);
    }

    // S席専用の超派手な音
    playSpecialSeatSound() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // 超豪華なメロディ（勝利のファンファーレ）
        const victoryMelody = [
            {freq: 523.25, time: 0, duration: 0.2},      // C5
            {freq: 659.25, time: 0.15, duration: 0.2},   // E5
            {freq: 783.99, time: 0.3, duration: 0.2},    // G5
            {freq: 1046.50, time: 0.45, duration: 0.3},  // C6
            {freq: 1318.51, time: 0.6, duration: 0.3},   // E6
            {freq: 1567.98, time: 0.75, duration: 0.4},  // G6
            {freq: 2093.00, time: 0.9, duration: 0.5},   // C7
        ];

        // メインメロディ（3重奏）
        for (let layer = 0; layer < 3; layer++) {
            victoryMelody.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.type = layer === 0 ? 'sawtooth' : layer === 1 ? 'triangle' : 'sine';
                const freqMultiplier = layer === 0 ? 1 : layer === 1 ? 1.26 : 1.5; // ユニゾン、3度、5度
                osc.frequency.setValueAtTime(note.freq * freqMultiplier, now + note.time);
                
                const volume = layer === 0 ? 0.4 : layer === 1 ? 0.3 : 0.25;
                gain.gain.setValueAtTime(volume, now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
            });
        }

        // 壮大なベースライン
        const bassLine = [
            {freq: 130.81, time: 0, duration: 0.4},    // C3
            {freq: 164.81, time: 0.4, duration: 0.4},  // E3
            {freq: 196.00, time: 0.8, duration: 0.6},  // G3
        ];

        bassLine.forEach(note => {
            const bass = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();
            
            bass.connect(bassGain);
            bassGain.connect(this.audioContext.destination);
            
            bass.type = 'sine';
            bass.frequency.setValueAtTime(note.freq, now + note.time);
            
            bassGain.gain.setValueAtTime(0.6, now + note.time);
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
            
            bass.start(now + note.time);
            bass.stop(now + note.time + note.duration);
        });

        // キラキラ効果音
        for (let i = 0; i < 12; i++) {
            const sparkle = this.audioContext.createOscillator();
            const sparkleGain = this.audioContext.createGain();
            
            sparkle.connect(sparkleGain);
            sparkleGain.connect(this.audioContext.destination);
            
            sparkle.type = 'sine';
            const sparkleFreq = 1000 + Math.random() * 2000; // 1000-3000Hz
            sparkle.frequency.setValueAtTime(sparkleFreq, now + i * 0.1);
            
            sparkleGain.gain.setValueAtTime(0.15, now + i * 0.1);
            sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
            
            sparkle.start(now + i * 0.1);
            sparkle.stop(now + i * 0.1 + 0.3);
        }

        // 太鼓のロール
        for (let i = 0; i < 20; i++) {
            const drum = this.audioContext.createOscillator();
            const drumGain = this.audioContext.createGain();
            
            drum.connect(drumGain);
            drumGain.connect(this.audioContext.destination);
            
            drum.type = 'sawtooth';
            drum.frequency.setValueAtTime(60 + Math.random() * 40, now + i * 0.05);
            
            drumGain.gain.setValueAtTime(0.2, now + i * 0.05);
            drumGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
            
            drum.start(now + i * 0.05);
            drum.stop(now + i * 0.05 + 0.1);
        }

        // 最後の大音量シンバル
        setTimeout(() => {
            const bufferSize = this.audioContext.sampleRate * 0.8;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
            }
            const finalCymbal = this.audioContext.createBufferSource();
            const cymbalGain = this.audioContext.createGain();
            const cymbalFilter = this.audioContext.createBiquadFilter();

            finalCymbal.buffer = buffer;
            finalCymbal.connect(cymbalFilter);
            cymbalFilter.connect(cymbalGain);
            cymbalGain.connect(this.audioContext.destination);

            cymbalFilter.type = 'highpass';
            cymbalFilter.frequency.setValueAtTime(6000, this.audioContext.currentTime);

            cymbalGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            cymbalGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

            finalCymbal.start(this.audioContext.currentTime);
            finalCymbal.stop(this.audioContext.currentTime + 0.8);
        }, 1000);
    }
    
    initializeElements() {
        this.nameInput = document.getElementById('nameInput');
        this.startButton = document.getElementById('startButton');
        this.inputSection = document.getElementById('inputSection');
        this.assignmentSection = document.getElementById('assignmentSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.memberName = document.getElementById('memberName');
        this.seatNumber = document.getElementById('seatNumber');
        this.roomsContainer = document.getElementById('roomsContainer');
        this.progressFill = document.getElementById('progressFill');
        this.restartButton = document.getElementById('restartButton');
        this.newAssignmentButton = document.getElementById('newAssignmentButton');
        this.finalResults = document.getElementById('finalResults');
        this.currentAssignment = document.getElementById('currentAssignment');
        this.use801Checkbox = document.getElementById('use801');
        this.use804Checkbox = document.getElementById('use804');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startAssignment());
        this.restartButton.addEventListener('click', () => this.restartAssignment());
        this.newAssignmentButton.addEventListener('click', () => this.newAssignment());
        
        // 部屋選択の変更
        this.use801Checkbox.addEventListener('change', () => this.updateRoomDisplay());
        this.use804Checkbox.addEventListener('change', () => this.updateRoomDisplay());
        
        // エンターキーでの開始
        this.nameInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.startAssignment();
            }
        });
    }
    
    initializeRoomDisplay() {
        this.updateRoomDisplay();
        this.updateSeatVisuals();
    }
    
    updateRoomDisplay() {
        const room801 = document.getElementById('room801');
        const room804 = document.getElementById('room804');
        
        if (this.use801Checkbox.checked) {
            room801.classList.remove('disabled');
        } else {
            room801.classList.add('disabled');
        }
        
        if (this.use804Checkbox.checked) {
            room804.classList.remove('disabled');
        } else {
            room804.classList.add('disabled');
        }
    }
    
    updateSeatVisuals() {
        // 全ての座席の状態を更新
        document.querySelectorAll('.desk').forEach(deskElement => {
            const seatId = deskElement.getAttribute('data-seat');
            const seat = this.findSeatById(seatId);
            
            if (seat) {
                deskElement.classList.remove('available', 'unavailable', 'assigned', 'highlight');
                
                if (seat.available) {
                    deskElement.classList.add('available');
                } else {
                    deskElement.classList.add('unavailable');
                }
            }
        });
    }
    
    findSeatById(seatId) {
        for (const roomSeats of Object.values(this.allSeats)) {
            const seat = roomSeats.find(s => s.id === seatId);
            if (seat) return seat;
        }
        return null;
    }
    
    parseMembers() {
        const input = this.nameInput.value.trim();
        if (!input) {
            alert('メンバーの名前を入力してください！');
            return false;
        }
        
        this.members = input.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (this.members.length < 2) {
            alert('最低2名以上のメンバーを入力してください！');
            return false;
        }
        
        // 重複チェック
        const uniqueMembers = [...new Set(this.members)];
        if (uniqueMembers.length !== this.members.length) {
            alert('重複している名前があります。重複を削除しますか？');
            this.members = uniqueMembers;
        }
        
        return true;
    }
    
    generateAvailableSeats() {
        this.availableSeats = [];
        
        const use801 = this.use801Checkbox.checked;
        const use804 = this.use804Checkbox.checked;
        
        if (!use801 && !use804) {
            alert('少なくとも1つの部屋を選択してください！');
            return false;
        }
        
        if (use801) {
            this.availableSeats.push(...this.allSeats['801'].filter(seat => seat.available));
        }
        
        if (use804) {
            this.availableSeats.push(...this.allSeats['804'].filter(seat => seat.available));
        }
        
        if (this.availableSeats.length < this.members.length) {
            alert(`利用可能な座席数（${this.availableSeats.length}席）が人数（${this.members.length}人）を下回っています！`);
            return false;
        }
        
        return true;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    createAssignments() {
        let shuffledMembers = this.shuffleArray(this.members);
        let availableSeatsForAssignment = [...this.availableSeats];

        this.assignments = [];

        // 中渡瀬さんの特別処理：必ず804号室に割り当て
        const nakawataseIndex = shuffledMembers.findIndex(member => member.includes('中渡瀬'));
        if (nakawataseIndex !== -1) {
            const nakawataseMember = shuffledMembers[nakawataseIndex];
            shuffledMembers.splice(nakawataseIndex, 1);

            // 804号室の空席を探す
            const room804Seats = availableSeatsForAssignment.filter(seat => seat.room === '804');
            if (room804Seats.length > 0) {
                // 804号室のランダムな席に割り当て
                const randomSeat = room804Seats[Math.floor(Math.random() * room804Seats.length)];
                this.assignments.push({
                    member: nakawataseMember,
                    seat: randomSeat
                });
                // 使用した席を削除
                const seatIndex = availableSeatsForAssignment.findIndex(s => s.id === randomSeat.id);
                availableSeatsForAssignment.splice(seatIndex, 1);
            }
        }

        // S席を優先的に割り当て
        const sSeats = availableSeatsForAssignment.filter(seat => seat.label.startsWith('S'));
        const otherSeats = availableSeatsForAssignment.filter(seat => !seat.label.startsWith('S'));

        // S席の数だけメンバーを取り出して優先割り当て
        const membersForSSeats = shuffledMembers.slice(0, sSeats.length);
        const remainingMembers = shuffledMembers.slice(sSeats.length);

        // 残りの席をシャッフル
        const shuffledOtherSeats = this.shuffleArray(otherSeats);

        // S席への割り当て
        membersForSSeats.forEach((member, index) => {
            this.assignments.push({
                member: member,
                seat: sSeats[index]
            });
        });

        // 残りのメンバーを残りの席に割り当て
        remainingMembers.forEach((member, index) => {
            this.assignments.push({
                member: member,
                seat: shuffledOtherSeats[index]
            });
        });

        // 全体をシャッフルして表示順序をランダムに
        this.assignments = this.shuffleArray(this.assignments);
    }
    
    resetSeatVisuals() {
        // 全ての座席をリセット
        document.querySelectorAll('.desk').forEach(deskElement => {
            const seatId = deskElement.getAttribute('data-seat');
            const seat = this.findSeatById(seatId);
            
            if (seat) {
                deskElement.classList.remove('assigned', 'highlight');
                const seatNameElement = deskElement.querySelector('.seat-name');
                seatNameElement.textContent = seat.currentOccupant;
                
                if (seat.available) {
                    deskElement.classList.add('available');
                    deskElement.classList.remove('unavailable');
                } else {
                    deskElement.classList.add('unavailable');
                    deskElement.classList.remove('available');
                }
            }
        });
    }
    
    async startAssignment() {
        if (!this.parseMembers()) return;
        if (!this.generateAvailableSeats()) return;
        if (this.isAssigning) return;

        // AudioContextの再開（ユーザーインタラクション後）
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.isAssigning = true;
        this.currentAssignmentIndex = 0;

        this.createAssignments();
        this.resetSeatVisuals();

        // セクションの切り替え
        this.inputSection.style.display = 'none';
        this.assignmentSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.restartButton.style.display = 'none';
        this.currentAssignment.style.display = 'flex';

        // 割り当てアニメーションを開始
        await this.animateAssignments();
    }
    
    async animateAssignments() {
        for (let i = 0; i < this.assignments.length; i++) {
            const assignment = this.assignments[i];
            
            // プログレスバーの更新
            const progress = ((i + 1) / this.assignments.length) * 100;
            this.progressFill.style.width = `${progress}%`;
            
            // 現在の割り当てを表示
            this.memberName.textContent = assignment.member;
            this.seatNumber.textContent = `${assignment.seat.room}号室 ${assignment.seat.label}`;
            
            // ドラムロール効果
            await this.drumRollEffect(assignment.seat);
            
            // 席の更新
            this.updateSeat(assignment.seat, assignment.member);
            
            // 次の割り当てまでの待機
            if (i < this.assignments.length - 1) {
                await this.sleep(2500);
            }
        }

        // 全ての割り当てが完了
        this.playCompletionSound();
        await this.sleep(1000);
        this.showResults();
    }
    
    async drumRollEffect(finalSeat) {
        const drumRollDuration = 2000; // 2秒
        const intervalTime = 100; // 100ms間隔
        const iterations = drumRollDuration / intervalTime;
        
        for (let i = 0; i < iterations; i++) {
            // ドラムロール音を再生
            if (i % 3 === 0) { // 3回に1回音を鳴らす
                this.playDrumRoll();
            }

            // ランダムな席を表示
            const randomSeat = this.availableSeats[Math.floor(Math.random() * this.availableSeats.length)];
            this.seatNumber.textContent = `${randomSeat.room}号室 ${randomSeat.label}`;

            // 席をハイライト
            this.highlightSeat(randomSeat.id);

            // 最後の数回は最終的な席に近づける
            if (i > iterations - 5) {
                this.seatNumber.textContent = `${finalSeat.room}号室 ${finalSeat.label}`;
                this.highlightSeat(finalSeat.id, finalSeat.label.startsWith('S'));
            }

            await this.sleep(intervalTime);
        }
        
        // 最終的な席を表示
        this.seatNumber.textContent = `${finalSeat.room}号室 ${finalSeat.label}`;
        this.highlightSeat(finalSeat.id, finalSeat.label.startsWith('S'));
        
        // S席の場合は特別な音を再生
        if (finalSeat.label.startsWith('S')) {
            this.playSpecialSeatSound(); // S席専用の超派手な音
        } else {
            this.playDecisionSound(); // 通常の決定音
        }
        
        await this.sleep(500);
    }
    
    highlightSeat(seatId, isSpecial = false) {
        // 全ての席のハイライトを削除
        document.querySelectorAll('.desk').forEach(desk => {
            desk.classList.remove('highlight', 'special-highlight');
        });
        
        // 指定された席をハイライト
        const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
        if (seatElement) {
            if (isSpecial) {
                seatElement.classList.add('special-highlight');
            } else {
                seatElement.classList.add('highlight');
            }
        }
    }
    
    updateSeat(seat, memberName) {
        const seatElement = document.querySelector(`[data-seat="${seat.id}"]`);
        
        if (seatElement) {
            seatElement.classList.remove('highlight', 'available');
            seatElement.classList.add('assigned');
            
            const seatNameElement = seatElement.querySelector('.seat-name');
            seatNameElement.textContent = memberName;
        }
    }
    
    showResults() {
        this.currentAssignment.style.display = 'none';
        this.restartButton.style.display = 'block';
        
        // 少し待ってから結果画面に切り替え（机の配置は表示したまま）
        setTimeout(() => {
            // 机の配置は表示したままにする
            this.resultsSection.style.display = 'block';
            this.displayFinalResults();
        }, 2000);
    }
    
    displayFinalResults() {
        this.finalResults.innerHTML = '';
        
        // 部屋と席番号順にソートして表示
        const sortedAssignments = [...this.assignments].sort((a, b) => {
            if (a.seat.room !== b.seat.room) {
                return a.seat.room.localeCompare(b.seat.room);
            }
            return a.seat.label.localeCompare(b.seat.label);
        });
        
        sortedAssignments.forEach((assignment, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.style.animationDelay = `${index * 0.1}s`;
            resultItem.innerHTML = `
                <div class="result-seat">${assignment.seat.room}号室 ${assignment.seat.label}</div>
                <div class="result-member">${assignment.member}</div>
            `;
            this.finalResults.appendChild(resultItem);
        });
    }
    
    restartAssignment() {
        if (this.isAssigning) return;
        
        // 同じメンバーで再度席替え
        this.startAssignment();
    }
    
    newAssignment() {
        // 最初の画面に戻る
        this.inputSection.style.display = 'block';
        this.assignmentSection.style.display = 'none';
        this.resultsSection.style.display = 'none';
        
        this.members = [];
        this.availableSeats = [];
        this.assignments = [];
        this.currentAssignmentIndex = 0;
        this.isAssigning = false;
        
        this.nameInput.value = '';
        this.nameInput.focus();
        this.updateSeatVisuals();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new SeatAssignmentApp();
});

// 追加のUI効果
document.addEventListener('DOMContentLoaded', () => {
    // ボタンのリップル効果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // リップルアニメーションのCSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        button {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
