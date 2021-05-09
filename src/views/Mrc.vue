<template>

  <v-card max-width="1800" class="mx-auto" flat>

    <v-container>
      <v-row>
        <v-col sm="12">
          <v-card flat >
            <v-card-title> 
              <v-icon large left color="blue darken-2">mdi-file-document-box</v-icon>
              <span class="text-h3">Question Answering 서비스</span>      
            </v-card-title>
          </v-card>

          <v-row no-gutters>
            <v-col cols="12" sm="12">

              <v-card flat>
                <v-select 
                  v-model="title" 
                  :items="titles" 
                  menu-props="auto" 
                  solo
                  label="문장을 선택하거나 아래 박스에 문장을 입력하세요."  
                  @change="change_title(title)">
                </v-select> 
              </v-card>
            </v-col>           

            <v-col cols="12" sm="12">
              <v-textarea outlined name="input-1" auto-grow rows="5" clearable label="" v-model="sentence">
              </v-textarea>
            </v-col> 
          </v-row>
        </v-col>
      </v-row>
    </v-container>


    <v-container>
      <v-row>
        <v-col sm="12">
          <v-row no-gutters>
            <v-col cols="12" sm="12">
              <v-card flat>
               <v-select 
                v-model='select'
                :items="qas" 
                item-text="question"
                item-value="answer"
                return-object
                label="질문을 선택하거나 아래 박스에 질문을 입력하세요." solo @change="change_question">
                </v-select> 
              </v-card>
            </v-col>
          </v-row>

          <v-textarea outlined name="input-1" label="" v-model="question" @input="change_question_input"
          rows="2" clearable >          
          </v-textarea>

          <p class="display-1 font-weight-bold justify-center" >
            [ 질 문 ] {{question}}
          </p>
         <p v-if="view_answer" class="grey--text display-1 font-weight-bold justify-center" >
            [ 정 답 ] {{select.answer}}
          </p>
          <p class="blue--text display-1 font-weight-bold justify-center" >
            [AI답변] {{answer}}
          </p>
        </v-col>

        <v-col cols="12" class='pa-2'>
          <v-layout align-center justify-center>
            <v-btn x-large class="primary"
              @click="qa_service" 
              :loading="process_dialog" 
              :disabled="process_dialog">
              질문하기
            </v-btn>
          </v-layout>
        </v-col>
      </v-row>
    </v-container>


    <div class="text-center">
      <v-dialog v-model="process_dialog" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Processing...
            <v-progress-linear indeterminate color="white" class="mb-0">
            </v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-center">
      <v-dialog v-model="answer_dialog" width="800">
        <v-card class="mx-auto" max-width="800">
          <v-toolbar color="indigo" dark>
            <v-toolbar-title>Answer</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <p class="text-h6">질문 : {{ question }}</p>          
            <p class="text-h6">답변 : {{ answer }}</p>
            <p class="text-h6">답변위치 : {{ start }} - {{ end }}</p>
            <p class="text-h6">정답확률 : {{ score }}</p>                       
          </v-container>
          <v-divider></v-divider>
          <v-card-actions>
            <v-layout align-center justify-center>
              <v-btn dark color="primary" 
              @click="answer_dialog = false">
                확 인
              </v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

  </v-card >
</template>
    

<script>
import axios from 'axios'
export default {
  data: () => ({
    disabled: false,
    process_dialog: false,
    answer_dialog: false,
    sentence_no: 0,  
    sentence: "",
    title: "",
    titles: [],
    sentence2: "",
    sentences: [],
    question: "",

    select: {
      question : "질문을 선택 또는 입력하세요.",
      answer : ""
    },

    view_answer: true,
    qas: [],

    start: 0,
    end: 0,
    score: "",
    answer: "",
    pos_data : "",
    duration : 120000,
    badge_class: 'badge',
    text_class: 'ml-2'
  }),
  created: function () {
    this.get_tilte(); 
  },  
  watch: {
    process_dialog(val) {
      if (!val) return
      setTimeout(() => (this.process_dialog = false), 5000)
    },
  },
  methods: {
    get_tilte() {
      let url = "http://localhost:8000/mrc/titles"
      axios.get(url).then((response) => {
        response.data.titles.forEach(el => this.titles.push({'value': el.sid, 'text': el.title}) )
      }).catch(function (error) {
        console.log(error);
      }); 
    },
    change_title(sid) {
      this.qas = []
      this.question = ""
      this.answer = ""
      this.right_answer = ""
      let url = "http://localhost:8000/mrc/sentence"
      let post_data = { "sid": sid }
      axios.post(url, post_data).then(response => {
        this.sentence = response["data"]["sentence"]; 
        this.qas = response["data"]["qas"]; 
      }).catch(function (error) {
        console.log(error);
      }); 
    },
    change_question(qa) {
      this.question = qa.question
      this.right_answer = qa.answer
      this.view_answer = true
      this.answer = ""
    },
    change_question_input() {
      this.view_answer = false
      this.answer = ""
    },
    qa_service() {
      if(this.process_dialog){
        this.$swal.fire({
          icon: 'info',
          title: 'MRC 진행중입니다.',
        });
        return
      }

      if(this.sentence == ""){
        this.$swal.fire({
          icon: 'info',
          title: '타이틀을 선택하세요.',
        });
        return
      }

      if(this.question == ""){
        this.$swal.fire({
          icon: 'info',
          title: '질문을 선택하세요.',
        });
        return
      }
      this.process_dialog = true
      let url = "http://localhost:8000/mrc/qa"
      let post_data = {"question": this.question, "sentence": this.sentence}
      axios.post(url, post_data).then(response => {
        this.process_dialog = false
        this.answer = response["data"]["answer"]
        this.start = response["data"]["start"]
        this.end = response["data"]["end"]
        this.score = response["data"]["score"]
        this.sentence2 = "<strong><font color='white'>" + this.sentence.slice(0, this.start) + "</font><font size='5' color='yellow'>" + this.sentence.slice(this.start, this.end) + "</font><font color='white'>" + this.sentence.slice(this.end) + "</font></strong>"
        this.answer_dialog = true
      }).catch(function (error) {
        console.log(error);
      }); 
    }
  }
}
</script>
